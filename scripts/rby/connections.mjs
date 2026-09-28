import { writeFileSync } from 'node:fs';

import { locationFor, pokeredDir, read } from './disassembly.mjs';
import { headers, mapTiles, STEP, WATER_TILE } from './tiles.mjs';

const OUTPUT = new URL(
  '../../src/data/maps/kanto-rby-connections.json',
  import.meta.url,
);
const WATER_TILES = new Set([WATER_TILE, 0x32, 0x48]);
const OUTDOOR = /^(ROUTE_\d+|[A-Z_]+_(TOWN|CITY|ISLAND)|INDIGO_PLATEAU)$/;

const ledgeTiles = new Set(
  [
    ...read(pokeredDir, 'data/tilesets/ledge_tiles.asm').matchAll(
      /db SPRITE_FACING_\w+,\s*\$\w+,\s*\$(\w+)/g,
    ),
  ].map(([, tile]) => parseInt(tile, 16)),
);

const grids = {};

const gridFor = (constant) => {
  if (grids[constant]) return grids[constant];

  const {
    name,
    columns,
    rows,
    passable,
    tileAt: tileAtTile,
  } = mapTiles(constant);

  const tileAt = (stepX, stepY) => tileAtTile(stepX * 2, stepY * 2 + 1);

  const inside = (x, y) => x >= 0 && y >= 0 && x < columns && y < rows;

  const walkable = (x, y) => {
    if (!inside(x, y)) return false;

    const tile = tileAt(x, y);

    return passable.has(tile) || WATER_TILES.has(tile);
  };

  const crossable = (x, y) =>
    walkable(x, y) || (inside(x, y) && ledgeTiles.has(tileAt(x, y)));

  const seeds = [
    ...read(pokeredDir, `data/maps/objects/${name}.asm`).matchAll(
      /(?:warp|object)_event\s+(\d+),\s*(\d+)/g,
    ),
  ].map(([, x, y]) => [Number(x), Number(y)]);

  grids[constant] = { columns, rows, walkable, crossable, seeds };

  return grids[constant];
};

const reachableFrom = (constant, extraSeeds) => {
  const grid = gridFor(constant);
  const reached = new Set();
  const queue = [...grid.seeds, ...extraSeeds];

  while (queue.length > 0) {
    const [x, y] = queue.pop();
    const key = y * grid.columns + x;

    if (reached.has(key) || !grid.crossable(x, y)) continue;

    reached.add(key);
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  const has = (x, y) => reached.has(y * grid.columns + x);

  return {
    walk: (x, y) => grid.walkable(x, y) && has(x, y),
    cross: (x, y) => grid.crossable(x, y) && has(x, y),
  };
};

const edgeSquare = (grid, direction, step) =>
  ({
    north: [step, 0],
    south: [step, grid.rows - 1],
    west: [0, step],
    east: [grid.columns - 1, step],
  })[direction];

const inward = { north: [0, 1], south: [0, -1], west: [1, 0], east: [-1, 0] };

const opposite = {
  north: 'south',
  south: 'north',
  west: 'east',
  east: 'west',
};

const openSteps = (constant, { direction, target, offset }, reachable) => {
  const here = gridFor(constant);
  const there = gridFor(target);
  const vertical = direction === 'north' || direction === 'south';
  const steps = vertical ? here.columns : here.rows;
  const targetSteps = vertical ? there.columns : there.rows;

  const clear = (grid, reach, side, step) => {
    const [x, y] = edgeSquare(grid, side, step);
    const [dx, dy] = inward[side];

    return reach.walk(x, y) && reach.cross(x + dx, y + dy);
  };

  return Array.from({ length: steps }, (_, step) => step).filter((step) => {
    const other = step - offset * 2;

    return (
      other >= 0 &&
      other < targetSteps &&
      clear(here, reachable[constant], direction, step) &&
      clear(there, reachable[target], opposite[direction], other)
    );
  });
};

const toArea = (grid, direction, start, length) =>
  ({
    north: { x: start, y: 0, width: length, height: STEP },
    south: {
      x: start,
      y: grid.rows * STEP - STEP,
      width: length,
      height: STEP,
    },
    west: { x: 0, y: start, width: STEP, height: length },
    east: {
      x: grid.columns * STEP - STEP,
      y: start,
      width: STEP,
      height: length,
    },
  })[direction];

const outdoorMaps = Object.entries(headers).filter(
  ([constant, header]) =>
    OUTDOOR.test(constant) && header.connections.length > 0,
);
const extraSeeds = {};
let open = {};

for (let pass = 0; pass < 10; pass++) {
  const reachable = new Proxy(
    {},
    {
      get: (cache, constant) =>
        (cache[constant] ??= reachableFrom(
          constant,
          extraSeeds[constant] ?? [],
        )),
    },
  );

  open = Object.fromEntries(
    outdoorMaps.map(([constant, header]) => [
      constant,
      header.connections.map((connection) => ({
        connection,
        steps: openSteps(constant, connection, reachable),
      })),
    ]),
  );

  let added = 0;

  for (const [constant, links] of Object.entries(open)) {
    for (const { connection, steps } of links) {
      const here = gridFor(constant);
      const there = gridFor(connection.target);

      for (const step of steps) {
        for (const [map, grid, side, at] of [
          [constant, here, connection.direction, step],
          [
            connection.target,
            there,
            opposite[connection.direction],
            step - connection.offset * 2,
          ],
        ]) {
          const square = edgeSquare(grid, side, at);
          const seeds = (extraSeeds[map] ??= []);

          if (!seeds.some(([x, y]) => x === square[0] && y === square[1])) {
            seeds.push(square);
            added++;
          }
        }
      }
    }
  }

  if (added === 0) break;
}

const connections = {};

for (const [constant, links] of Object.entries(open)) {
  const grid = gridFor(constant);

  connections[locationFor(constant)] = links.flatMap(
    ({ connection, steps }) => {
      const runs = [];

      for (const step of steps) {
        const last = runs.at(-1);

        if (last && last.end === step - 1) last.end = step;
        else runs.push({ start: step, end: step });
      }

      return runs.map(({ start, end }) => ({
        to: locationFor(connection.target),
        direction: connection.direction,
        area: toArea(
          grid,
          connection.direction,
          start * STEP,
          (end - start + 1) * STEP,
        ),
      }));
    },
  );
}

writeFileSync(OUTPUT, `${JSON.stringify(connections, null, 2)}\n`);

console.log(
  `Wrote connections for ${Object.keys(connections).length} maps to src/data/maps/kanto-rby-connections.json`,
);
