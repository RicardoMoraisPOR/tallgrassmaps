import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { readPng } from '../lib/png.mjs';
import { read } from './disassembly.mjs';

export const TILE = 8;
export const BACKGROUND_SHADES = [0, 96, 168, 248];

const chainedLabels = (text, suffix, value) => {
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

const camel = (constant) =>
  constant
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

export const mapHeaders = (dir) =>
  new Map(
    readdirSync(join(dir, 'data/maps/headers')).map((file) => {
      const name = file.replace('.asm', '');
      const [, constant] = read(dir, `data/maps/headers/${file}`).match(
        /map_header\s+\w+,\s*(\w+)/,
      );

      return [constant.replaceAll('_', ''), name];
    }),
  );

export const mapTiles = (dir, name) => {
  const [, constant, tileset] = read(
    dir,
    `data/maps/headers/${name}.asm`,
  ).match(/map_header\s+\w+,\s*(\w+),\s*(\w+)/);
  const [, width, height] = read(dir, 'constants/map_constants.asm')
    .match(new RegExp(`map_const ${constant},\\s*(\\d+),\\s*(\\d+)`))
    .map(Number);
  const set = camel(tileset);
  const tilesets = read(dir, 'gfx/tilesets.asm');
  const gfx = chainedLabels(
    tilesets,
    'GFX',
    (line) => line.match(/INCBIN "([^"]+)\.2bpp"/)?.[1],
  )[set];
  const blockset = readFileSync(
    join(
      dir,
      chainedLabels(
        tilesets,
        'Block',
        (line) => line.match(/INCBIN "([^"]+\.bst)"/)?.[1],
      )[set],
    ),
  );
  const blocks = readFileSync(
    join(
      dir,
      chainedLabels(
        read(dir, 'maps.asm'),
        'Blocks',
        (line) => line.match(/INCBIN "([^"]+\.blk)"/)?.[1],
      )[name],
    ),
  );
  const tiles = readPng(join(dir, `${gfx}.png`));
  const tilesPerRow = tiles.width / TILE;

  const tileAt = (tileX, tileY) => {
    const block = blocks[Math.floor(tileY / 4) * width + Math.floor(tileX / 4)];

    return blockset[block * 16 + (tileY % 4) * 4 + (tileX % 4)];
  };

  const shadeAt = (tile, x, y) => {
    const sourceY = Math.floor(tile / tilesPerRow) * TILE + y;

    return sourceY < tiles.height
      ? BACKGROUND_SHADES[
          tiles.sample((tile % tilesPerRow) * TILE + x, sourceY)
        ]
      : 0;
  };

  return {
    tileCount: tilesPerRow * Math.floor(tiles.height / TILE),
    tilesWide: width * 4,
    tilesHigh: height * 4,
    pixelWidth: width * 32,
    pixelHeight: height * 32,
    tileAt,
    shadeAt,
  };
};

export const mapObjects = (dir, name) =>
  [
    ...read(dir, `data/maps/objects/${name}.asm`).matchAll(
      /object_event\s+(\d+),\s*(\d+)/g,
    ),
  ].map(([, x, y]) => ({ x: Number(x), y: Number(y) }));
