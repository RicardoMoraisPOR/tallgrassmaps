import { pokeredDir, read } from './disassembly.mjs';
import { SHORE_TILES, WATER_TILE } from './tiles.mjs';

export const NO_SHORE_TILESETS = new Set(['ShipPort', 'Gym']);

export const CYCLING_ROAD_MAPS = new Set(['ROUTE_16', 'ROUTE_17', 'ROUTE_18']);

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

const waterTile = (tiles, tile) =>
  tile === WATER_TILE ||
  (!NO_SHORE_TILESETS.has(tiles.tileset) && SHORE_TILES.includes(tile));

const openTile = (tiles, x, y, { cut = true, surf = true } = {}) => {
  if (x < 0 || y < 0 || x >= tiles.columns || y >= tiles.rows) return false;

  const tile = tiles.tileAt(x * 2, y * 2 + 1);

  return (
    (tiles.passable.has(tile) && !ledgeTiles.has(tile)) ||
    (cut && tile === CUT_TREE_TILES[tiles.tileset]) ||
    (surf && waterTile(tiles, tile))
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

export const createReach =
  ({ dir, headers, mapTiles }) =>
  ({ cut = true, surf = true } = {}) => {
    const allowed = (constant) => ({
      cut,
      surf: surf && !CYCLING_ROAD_MAPS.has(constant),
    });

    const warpSteps = (constant) =>
      [
        ...read(
          dir,
          `data/maps/objects/${headers[constant].name}.asm`,
        ).matchAll(/warp_event\s+(\d+),\s*(\d+)/g),
      ].map(([, x, y]) => [Number(x), Number(y)]);

    const reachedSteps = (() => {
      const connected = Object.keys(headers).filter(
        (constant) => headers[constant].connections.length > 0,
      );
      const reached = new Map(
        connected.map((constant) => [constant, new Set()]),
      );

      const fill = (constant, seeds) => {
        const tiles = mapTiles(constant);
        const steps = reached.get(constant);
        const queue = [...seeds];
        let grew = false;

        while (queue.length > 0) {
          const [x, y] = queue.pop();
          const key = y * tiles.columns + x;

          if (steps.has(key) || !openTile(tiles, x, y, allowed(constant)))
            continue;

          steps.add(key);
          grew = true;
          queue.push(...moves(tiles, x, y));
        }

        return grew;
      };

      for (const constant of connected) fill(constant, warpSteps(constant));

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
          const queue = warpSteps(constant);

          while (queue.length > 0) {
            const [x, y] = queue.pop();
            const key = y * tiles.columns + x;

            if (own.has(key) || !openTile(tiles, x, y, allowed(constant)))
              continue;

            own.add(key);
            queue.push(...moves(tiles, x, y));
          }

          return own;
        })();

      return (x, y) => steps.has(y * tiles.columns + x);
    };

    return reachableSteps;
  };
