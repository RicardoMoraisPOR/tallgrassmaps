import { writeFileSync } from 'node:fs';

import {
  floorFor,
  forGame,
  games,
  hasOwnMapImage,
  pokeredDir,
  read,
  siteLocation,
} from './disassembly.mjs';
import { createReach, CYCLING_ROAD_MAPS, NO_SHORE_TILESETS } from './reach.mjs';
import { gameTiles, SHORE_TILES, WATER_TILE } from './tiles.mjs';

const OUTPUT = new URL(
  '../../src/data/maps/kanto-rby-wild.json',
  import.meta.url,
);

const DECORATIVE_WATER_TILESETS = new Set(['Gym', 'Dojo', 'Facility']);

const TERRAIN_BY_TILESET = {
  Cavern: 'cavern',
  Plateau: 'cavern',
  Cemetery: 'indoors',
  Facility: 'indoors',
};

const STAR_GRASS_TILES = { Forest: 0x34 };

const STAR_GRASS_NOTE =
  "Grass with a star in its corner doesn't give encounters";

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

const areasFor = ({ dir, define }) => {
  const { headers, isIndoorMap, mapTiles, waterTilesets } = gameTiles(dir);

  const superRodMaps = new Set(
    [...read(dir, 'data/wild/super_rod.asm').matchAll(/^\s*dbw? (\w+),/gm)].map(
      ([, constant]) => constant,
    ),
  );

  const reachableSteps = createReach({ dir, headers, mapTiles })();

  const wildLabels = (() => {
    const constants = [
      ...read(dir, 'constants/map_constants.asm').matchAll(
        /^\s*map_const (\w+),/gm,
      ),
    ].map(([, constant]) => constant);
    const labels = [
      ...read(dir, 'data/wild/grass_water.asm').matchAll(
        /^\s*dw (\w+)WildMons/gm,
      ),
    ].map(([, label]) => label);

    if (labels.length !== constants.length)
      throw new Error(
        `${labels.length} wild pointers for ${constants.length} maps`,
      );

    return new Map(
      constants.map((constant, index) => [constant, labels[index]]),
    );
  })();

  const grassRate = (constant) => {
    const label = wildLabels.get(constant);

    if (label === 'Nothing') return 0;

    const lines = forGame(read(dir, `data/wild/maps/${label}.asm`), define);

    return Number(
      lines
        .find((line) => line.startsWith('def_grass_wildmons'))
        ?.split(/\s+/)[1] ?? 0,
    );
  };

  const mappedConstants = Object.keys(headers).filter((constant) => {
    const path = siteLocation(constant);

    return path && hasOwnMapImage(dir, constant, path, floorFor(constant));
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
    const neighbours = (x, y) =>
      [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].map(([dx, dy]) => [x + dx, y + dy]);
    const cyclingRoad = hasWater && CYCLING_ROAD_MAPS.has(constant);
    const fishedFromLand =
      cyclingRoad &&
      (() => {
        const fished = new Set();
        const queue = [];

        for (let y = 0; y < tiles.rows; y++)
          for (let x = 0; x < tiles.columns; x++)
            if (
              anyWater(x, y) &&
              neighbours(x, y).some(([nx, ny]) => reachable(nx, ny))
            )
              queue.push([x, y]);

        while (queue.length > 0) {
          const [x, y] = queue.pop();
          const key = y * tiles.columns + x;

          if (
            fished.has(key) ||
            x < 0 ||
            y < 0 ||
            x >= tiles.columns ||
            y >= tiles.rows ||
            !anyWater(x, y)
          )
            continue;

          fished.add(key);
          queue.push(...neighbours(x, y));
        }

        return (x, y) => fished.has(y * tiles.columns + x);
      })();
    const reachableWater = (x, y) =>
      anyWater(x, y) &&
      (cyclingRoad ? fishedFromLand(x, y) : reachable(x, y)) &&
      neighbours(x, y).some(([nx, ny]) => anyWater(nx, ny));
    const topHalfWater = (x, y) =>
      NO_SHORE_TILESETS.has(tiles.tileset) &&
      tiles.tileAt(x * 2, y * 2) === WATER_TILE &&
      tiles.tileAt(x * 2 + 1, y * 2) === WATER_TILE;
    const isWater = (x, y) =>
      reachableWater(x, y) ||
      (topHalfWater(x, y) &&
        neighbours(x, y).some(([nx, ny]) => reachableWater(nx, ny)));
    const water = hasWater && {
      outline: outline(tiles.columns, tiles.rows, isWater),
    };
    const cutOutWater = water && water.outline.length > 0;

    const starGrass = STAR_GRASS_TILES[tiles.tileset];
    const grassLooking = (x, y) =>
      standingOn(x, y) === tiles.grassTile || standingOn(x, y) === starGrass;

    const walk = anywhere
      ? {
          whole: true,
          ...(cutOutWater && {
            outline: outline(
              tiles.columns,
              tiles.rows,
              (x, y) => !isWater(x, y),
            ),
          }),
        }
      : grass > 0 &&
        tiles.grassTile !== undefined && {
          outline: outline(tiles.columns, tiles.rows, grassLooking),
          ...(starGrass !== undefined && { note: STAR_GRASS_NOTE }),
        };

    return [
      walk && {
        ...place,
        method: 'walk',
        terrain: TERRAIN_BY_TILESET[tiles.tileset] ?? 'grass',
        ...walk,
      },
      water && { ...place, method: 'water', ...water },
    ].filter((area) => area && (area.whole || area.outline.length > 0));
  });

  return wildAreas;
};

const sources = [
  { dir: pokeredDir, define: '_RED' },
  ...games.filter(({ dir }) => dir !== pokeredDir),
];
const merged = new Map();

for (const source of sources) {
  const ids = games.filter(({ dir }) => dir === source.dir).map(({ id }) => id);

  for (const area of areasFor(source)) {
    const key = JSON.stringify(area);

    merged.set(key, [...(merged.get(key) ?? []), ...ids]);
  }
}

const wildAreas = [...merged].map(([key, ids]) => ({
  ...JSON.parse(key),
  ...(ids.length < games.length && { games: ids }),
}));

writeFileSync(OUTPUT, `${JSON.stringify(wildAreas, null, 2)}\n`);

console.log(
  wildAreas
    .map(
      ({ path, floor, method, whole, outline: rings }) =>
        `${path}${floor ? `/${floor}` : ''} ${method}: ${whole ? 'whole map' : `${rings.length} rings`}`,
    )
    .join('\n'),
);
