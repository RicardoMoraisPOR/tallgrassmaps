import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { pokeredDir, read } from './disassembly.mjs';

export const STEP = 16;
export const WATER_TILE = 0x14;
export const SHORE_TILES = [0x32, 0x48];

const camel = (constant) =>
  constant
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

const labelledValues = (text, suffix, value) => {
  const table = {};
  let pending = [];

  for (const line of text.split('\n')) {
    const label = line.match(new RegExp(`^(\\w+)_${suffix}::?`));

    if (label) pending.push(label[1]);

    const found = value(line);

    if (found !== undefined && pending.length > 0) {
      for (const name of pending) table[name] = found;
      pending = [];
    }
  }

  return table;
};

export const gameTiles = (dir) => {
  const blocksets = labelledValues(
    read(dir, 'gfx/tilesets.asm'),
    'Block',
    (line) => line.match(/INCBIN "([^"]+\.bst)"/)?.[1],
  );

  const collisions = labelledValues(
    read(dir, 'data/tilesets/collision_tile_ids.asm'),
    'Coll',
    (line) => {
      const tiles = line.match(/coll_tiles\s+(.*)$/)?.[1];

      return tiles
        ? new Set(
            tiles.split(',').map((tile) => parseInt(tile.trim().slice(1), 16)),
          )
        : undefined;
    },
  );

  const grassTiles = Object.fromEntries(
    [
      ...read(dir, 'data/tilesets/tileset_headers.asm').matchAll(
        /^\s*tileset (\w+),(?:\s*-?\$?\w+,){3}\s*(-1|\$\w+),/gm,
      ),
    ].map(([, name, tile]) => [
      name,
      tile === '-1' ? undefined : parseInt(tile.slice(1), 16),
    ]),
  );

  const waterTilesets = new Set(
    [
      ...read(dir, 'data/tilesets/water_tilesets.asm').matchAll(
        /^\s*db ([A-Z_]+)$/gm,
      ),
    ].map(([, constant]) => camel(constant)),
  );

  const mapConstantsText = read(dir, 'constants/map_constants.asm');

  const mapOrder = [
    ...mapConstantsText.matchAll(
      /map_const (\w+),\s*(\d+),\s*(\d+)|FIRST_INDOOR_MAP/g,
    ),
  ];

  const firstIndoorIndex = mapOrder.findIndex(
    ([match]) => match === 'FIRST_INDOOR_MAP',
  );

  const mapSizes = Object.fromEntries(
    mapOrder
      .filter(([, constant]) => constant)
      .map(([, constant, width, height]) => [
        constant,
        { width: Number(width), height: Number(height) },
      ]),
  );

  const isIndoorMap = (constant) =>
    mapOrder.findIndex(([, name]) => name === constant) > firstIndoorIndex;

  const blockFiles = labelledValues(
    read(dir, 'maps.asm'),
    'Blocks',
    (line) => line.match(/INCBIN "([^"]+)"/)?.[1],
  );

  const headers = Object.fromEntries(
    readdirSync(join(dir, 'data/maps/headers')).map((file) => {
      const text = read(dir, `data/maps/headers/${file}`);
      const [, name, constant, tileset] = text.match(
        /map_header\s+(\w+),\s*(\w+),\s*(\w+)/,
      );
      const connections = [
        ...text.matchAll(/connection (\w+),\s*\w+,\s*(\w+),\s*(-?\d+)/g),
      ].map(([, direction, target, offset]) => ({
        direction,
        target,
        offset: Number(offset),
      }));

      return [constant, { name, tileset: camel(tileset), connections }];
    }),
  );

  const tileCache = {};

  const mapTiles = (constant) => {
    if (tileCache[constant]) return tileCache[constant];

    const { name, tileset } = headers[constant];
    const { width, height } = mapSizes[constant];
    const blockset = readFileSync(join(dir, blocksets[tileset]));
    const blocks = readFileSync(join(dir, blockFiles[name]));

    const tileAt = (tileX, tileY) => {
      const block =
        blocks[Math.floor(tileY / 4) * width + Math.floor(tileX / 4)];

      return blockset[block * 16 + (tileY % 4) * 4 + (tileX % 4)];
    };

    tileCache[constant] = {
      name,
      tileset,
      columns: width * 2,
      rows: height * 2,
      passable: collisions[tileset],
      grassTile: grassTiles[tileset],
      tileAt,
    };

    return tileCache[constant];
  };

  return { waterTilesets, isIndoorMap, headers, mapTiles };
};

export const { waterTilesets, isIndoorMap, headers, mapTiles } =
  gameTiles(pokeredDir);
