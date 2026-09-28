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
    ...(tiles.tileset === 'ShipPort' ? [] : SHORE_TILES),
  ]);
  const anywhere =
    grass > 0 && isIndoorMap(constant) && tiles.tileset !== 'Forest';
  const hasWater =
    waterTilesets.has(tiles.tileset) &&
    !DECORATIVE_WATER_TILESETS.has(tiles.tileset);
  const isWater = (x, y) => fishable.has(facing(x, y));
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
