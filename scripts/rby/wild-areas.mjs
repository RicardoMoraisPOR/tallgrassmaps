import { writeFileSync } from 'node:fs';

import {
  floorFor,
  forGame,
  hasOwnMapImage,
  pokeredDir,
  read,
  siteLocation,
} from './disassembly.mjs';
import {
  headers,
  isIndoorMap,
  mapTiles,
  SHORE_TILES,
  WATER_TILE,
  waterTilesets,
} from './tiles.mjs';

const OUTPUT = new URL(
  '../../src/data/maps/kanto-rby-wild.json',
  import.meta.url,
);

const DECORATIVE_WATER_TILESETS = new Set(['Gym', 'Dojo', 'Facility']);

const NO_SHORE_TILESETS = new Set(['ShipPort', 'Gym']);

const superRodMaps = new Set(
  [...read(pokeredDir, 'data/wild/super_rod.asm').matchAll(/dbw (\w+),/g)].map(
    ([, constant]) => constant,
  ),
);

const CUT_TREE_TILES = { Overworld: 0x3d, Gym: 0x50 };

const LEDGE_DIRECTIONS = {
  DOWN: [0, 1],
  UP: [0, -1],
  LEFT: [-1, 0],
  RIGHT: [1, 0],
};

const ledges = [
  ...read(pokeredDir, 'data/tilesets/ledge_tiles.asm').matchAll(
    /db SPRITE_FACING_(\w+),\s*\$(\w+),\s*\$(\w+)/g,
  ),
].map(([, facing, standing, ledge]) => ({
  direction: LEDGE_DIRECTIONS[facing],
  standing: parseInt(standing, 16),
  ledge: parseInt(ledge, 16),
}));

const ledgeTiles = new Set(ledges.map(({ ledge }) => ledge));

const openTile = (tiles, x, y) => {
  if (x < 0 || y < 0 || x >= tiles.columns || y >= tiles.rows) return false;

  const tile = tiles.tileAt(x * 2, y * 2 + 1);

  return (
    (tiles.passable.has(tile) && !ledgeTiles.has(tile)) ||
    tile === CUT_TREE_TILES[tiles.tileset] ||
    tile === WATER_TILE ||
    (!NO_SHORE_TILESETS.has(tiles.tileset) && SHORE_TILES.includes(tile))
  );
};

const edgeStep = (tiles, direction, step) =>
  ({
    north: [step, 0],
    south: [step, tiles.rows - 1],
    west: [0, step],
    east: [tiles.columns - 1, step],
  })[direction];

const opposite = { north: 'south', south: 'north', west: 'east', east: 'west' };

const moves = (tiles, x, y) =>
  Object.values(LEDGE_DIRECTIONS).flatMap(([dx, dy]) => {
    const tile =
      x + dx >= 0 &&
      y + dy >= 0 &&
      x + dx < tiles.columns &&
      y + dy < tiles.rows
        ? tiles.tileAt((x + dx) * 2, (y + dy) * 2 + 1)
        : undefined;

    if (!ledgeTiles.has(tile)) return [[x + dx, y + dy]];

    const standing = tiles.tileAt(x * 2, y * 2 + 1);
    const jumps = ledges.some(
      (ledge) =>
        ledge.direction[0] === dx &&
        ledge.direction[1] === dy &&
        ledge.standing === standing &&
        ledge.ledge === tile,
    );

    return jumps ? [[x + dx * 2, y + dy * 2]] : [];
  });

const objectSteps = (constant) =>
  [
    ...read(
      pokeredDir,
      `data/maps/objects/${headers[constant].name}.asm`,
    ).matchAll(/(?:warp|object)_event\s+(\d+),\s*(\d+)/g),
  ].map(([, x, y]) => [Number(x), Number(y)]);

const reachedSteps = (() => {
  const connected = Object.keys(headers).filter(
    (constant) => headers[constant].connections.length > 0,
  );
  const reached = new Map(connected.map((constant) => [constant, new Set()]));

  const fill = (constant, seeds) => {
    const tiles = mapTiles(constant);
    const steps = reached.get(constant);
    const queue = [...seeds];
    let grew = false;

    while (queue.length > 0) {
      const [x, y] = queue.pop();
      const key = y * tiles.columns + x;

      if (steps.has(key) || !openTile(tiles, x, y)) continue;

      steps.add(key);
      grew = true;
      queue.push(...moves(tiles, x, y));
    }

    return grew;
  };

  for (const constant of connected) fill(constant, objectSteps(constant));

  for (let grew = true; grew;) {
    grew = false;

    for (const constant of connected) {
      const tiles = mapTiles(constant);

      for (const { direction, target, offset } of headers[constant]
        .connections) {
        if (!reached.has(target)) continue;

        const other = mapTiles(target);
        const vertical = direction === 'north' || direction === 'south';
        const length = vertical ? tiles.columns : tiles.rows;
        const seeds = Array.from({ length }, (_, step) => step).flatMap(
          (step) => {
            const [x, y] = edgeStep(tiles, direction, step);

            return reached.get(constant).has(y * tiles.columns + x)
              ? [edgeStep(other, opposite[direction], step - offset * 2)]
              : [];
          },
        );

        if (fill(target, seeds)) grew = true;
      }
    }
  }

  return reached;
})();

const reachableSteps = (constant, tiles) => {
  const steps =
    reachedSteps.get(constant) ??
    (() => {
      const own = new Set();
      const queue = objectSteps(constant);

      while (queue.length > 0) {
        const [x, y] = queue.pop();
        const key = y * tiles.columns + x;

        if (own.has(key) || !openTile(tiles, x, y)) continue;

        own.add(key);
        queue.push(...moves(tiles, x, y));
      }

      return own;
    })();

  return (x, y) => steps.has(y * tiles.columns + x);
};

const wildLabels = (() => {
  const constants = [
    ...read(pokeredDir, 'constants/map_constants.asm').matchAll(
      /^\s*map_const (\w+),/gm,
    ),
  ].map(([, constant]) => constant);
  const labels = [
    ...read(pokeredDir, 'data/wild/grass_water.asm').matchAll(
      /^\s*dw (\w+)WildMons/gm,
    ),
  ].map(([, label]) => label);

  if (labels.length !== constants.length)
    throw new Error(
      `${labels.length} wild pointers for ${constants.length} maps`,
    );

  return new Map(constants.map((constant, index) => [constant, labels[index]]));
})();

const grassRate = (constant) => {
  const label = wildLabels.get(constant);

  if (label === 'Nothing') return 0;

  const lines = forGame(
    read(pokeredDir, `data/wild/maps/${label}.asm`),
    '_RED',
  );

  return Number(
    lines
      .find((line) => line.startsWith('def_grass_wildmons'))
      ?.split(/\s+/)[1] ?? 0,
  );
};

const outline = (columns, rows, included) => {
  const inside = (x, y) =>
    x >= 0 && y >= 0 && x < columns && y < rows && included(x, y);
  const edges = new Map();

  const addEdge = (from, to) => {
    const key = from.join();

    edges.set(key, [...(edges.get(key) ?? []), to]);
  };

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      if (!inside(x, y)) continue;
      if (!inside(x, y - 1)) addEdge([x, y], [x + 1, y]);
      if (!inside(x + 1, y)) addEdge([x + 1, y], [x + 1, y + 1]);
      if (!inside(x, y + 1)) addEdge([x + 1, y + 1], [x, y + 1]);
      if (!inside(x - 1, y)) addEdge([x, y + 1], [x, y]);
    }
  }

  const rings = [];

  for (const start of [...edges.keys()]) {
    while (edges.get(start)?.length) {
      const ring = [start.split(',').map(Number)];
      let point = ring[0];

      for (;;) {
        const next = edges.get(point.join()).shift();

        if (next.join() === start) break;

        ring.push(next);
        point = next;
      }

      rings.push(
        ring.filter((point, index) => {
          const before = ring.at(index - 1);
          const after = ring[(index + 1) % ring.length];

          return !(
            (before[0] === point[0] && point[0] === after[0]) ||
            (before[1] === point[1] && point[1] === after[1])
          );
        }),
      );
    }
  }

  return rings;
};

const mappedConstants = Object.keys(headers).filter((constant) => {
  const path = siteLocation(constant);

  return path && hasOwnMapImage(pokeredDir, constant, path, floorFor(constant));
});

const wildAreas = mappedConstants.flatMap((constant) => {
  const tiles = mapTiles(constant);
  const grass = grassRate(constant);
  const place = { path: siteLocation(constant), floor: floorFor(constant) };
  const standingOn = (x, y) => tiles.tileAt(x * 2 + 1, y * 2 + 1);
  const facing = (x, y) => tiles.tileAt(x * 2, y * 2 + 1);
  const fishable = new Set([
    WATER_TILE,
    ...(NO_SHORE_TILESETS.has(tiles.tileset) ? [] : SHORE_TILES),
  ]);
  const anywhere =
    grass > 0 && isIndoorMap(constant) && tiles.tileset !== 'Forest';
  const hasWater =
    waterTilesets.has(tiles.tileset) &&
    (!DECORATIVE_WATER_TILESETS.has(tiles.tileset) ||
      superRodMaps.has(constant));
  const anyWater = (x, y) => fishable.has(facing(x, y));
  const reachable = hasWater && reachableSteps(constant, tiles);
  const isWater = (x, y) =>
    anyWater(x, y) &&
    reachable(x, y) &&
    [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ].some(([dx, dy]) => anyWater(x + dx, y + dy));
  const water = hasWater && {
    outline: outline(tiles.columns, tiles.rows, isWater),
  };
  const cutOutWater = water && water.outline.length > 0;

  const walk = anywhere
    ? {
        whole: true,
        ...(cutOutWater && {
          outline: outline(tiles.columns, tiles.rows, (x, y) => !isWater(x, y)),
        }),
      }
    : grass > 0 &&
      tiles.grassTile !== undefined && {
        outline: outline(
          tiles.columns,
          tiles.rows,
          (x, y) => standingOn(x, y) === tiles.grassTile,
        ),
      };

  return [
    walk && { ...place, method: 'walk', ...walk },
    water && { ...place, method: 'water', ...water },
  ].filter((area) => area && (area.whole || area.outline.length > 0));
});

writeFileSync(OUTPUT, `${JSON.stringify(wildAreas, null, 2)}\n`);

console.log(
  wildAreas
    .map(
      ({ path, floor, method, whole, outline: rings }) =>
        `${path}${floor ? `/${floor}` : ''} ${method}: ${whole ? 'whole map' : `${rings.length} rings`}`,
    )
    .join('\n'),
);
