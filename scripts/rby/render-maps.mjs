import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { readPng, writePng } from '../lib/png.mjs';
import { pokeredDir, pokeyellowDir, read } from './disassembly.mjs';

const OUTPUT = fileURLToPath(
  new URL('../../public/maps/rby/', import.meta.url),
);
const TILE = 8;
const STEP = 16;
const SPRITE_LIFT = 4;
const BACKGROUND_SHADES = [0, 96, 168, 248];
const SPRITE_SHADES = [0, 168, 248];
const FACING_FRAMES = { DOWN: 0, UP: 1, LEFT: 2, RIGHT: 2 };

const maps = [
  ...[
    ['ViridianPokecenter', 'viridian-pokemon-center'],
    ['PewterPokecenter', 'pewter-pokemon-center'],
    ['CeruleanPokecenter', 'cerulean-pokemon-center'],
    ['LavenderPokecenter', 'lavender-pokemon-center'],
    ['VermilionPokecenter', 'vermilion-pokemon-center'],
    ['CeladonPokecenter', 'celadon-pokemon-center'],
    ['FuchsiaPokecenter', 'fuchsia-pokemon-center'],
    ['SaffronPokecenter', 'saffron-pokemon-center'],
    ['CinnabarPokecenter', 'cinnabar-pokemon-center'],
    ['MtMoonPokecenter', 'mt-moon-pokemon-center'],
    ['RockTunnelPokecenter', 'rock-tunnel-pokemon-center'],
    ['ViridianMart', 'viridian-poke-mart'],
    ['PewterMart', 'pewter-poke-mart'],
    ['CeruleanMart', 'cerulean-poke-mart'],
    ['LavenderMart', 'lavender-poke-mart'],
    ['VermilionMart', 'vermilion-poke-mart'],
    ['FuchsiaMart', 'fuchsia-poke-mart'],
    ['SaffronMart', 'saffron-poke-mart'],
    ['CinnabarMart', 'cinnabar-poke-mart'],
    ['IndigoPlateauLobby', 'indigo-plateau-lobby'],
  ].map(([name, out]) => ({ name, out: `${out}.png` })),
  ...['1F', '2F', '3F', '4F', '5F', 'Roof'].map((floor) => ({
    name: `CeladonMart${floor}`,
    out: `celadon-dept-store/${floor.toLowerCase()}.png`,
  })),
];

const games = [
  { dir: pokeredDir, outDir: OUTPUT },
  { dir: pokeyellowDir, outDir: join(OUTPUT, 'variants/yellow') },
];

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

const hiddenObjects = (dir) =>
  new Set(
    [
      ...read(dir, 'data/maps/toggleable_objects.asm').matchAll(
        /toggle_object_state\s+(\w+),\s*OFF/g,
      ),
    ].map(([, name]) => name),
  );

const render = (dir, name) => {
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
  const pixelWidth = width * 32;
  const pixelHeight = height * 32;
  const rgba = Buffer.alloc(pixelWidth * pixelHeight * 4);

  const paint = (x, y, shade) => {
    const i = (y * pixelWidth + x) * 4;

    rgba[i] = shade;
    rgba[i + 1] = shade;
    rgba[i + 2] = shade;
    rgba[i + 3] = 255;
  };

  for (let tileY = 0; tileY < height * 4; tileY++) {
    for (let tileX = 0; tileX < width * 4; tileX++) {
      const block =
        blocks[Math.floor(tileY / 4) * width + Math.floor(tileX / 4)];
      const tile = blockset[block * 16 + (tileY % 4) * 4 + (tileX % 4)];
      const sourceX = (tile % tilesPerRow) * TILE;
      const sourceY = Math.floor(tile / tilesPerRow) * TILE;

      for (let y = 0; y < TILE; y++) {
        for (let x = 0; x < TILE; x++) {
          const shade =
            sourceY + y < tiles.height
              ? BACKGROUND_SHADES[tiles.sample(sourceX + x, sourceY + y)]
              : 0;

          paint(tileX * TILE + x, tileY * TILE + y, shade);
        }
      }
    }
  }

  const objectsFile = read(dir, `data/maps/objects/${name}.asm`);
  const constants = [...objectsFile.matchAll(/const_export\s+(\w+)/g)].map(
    ([, name]) => name,
  );
  const hidden = hiddenObjects(dir);
  const objects = [
    ...objectsFile.matchAll(
      /object_event\s+(\d+),\s*(\d+),\s*SPRITE_(\w+),\s*\w+,\s*(\w+)/g,
    ),
  ];

  objects.forEach(([, x, y, sprite, facing], index) => {
    if (hidden.has(constants[index])) return;

    const sheet = readPng(join(dir, `gfx/sprites/${sprite.toLowerCase()}.png`));
    const frame = sheet.height >= 48 ? (FACING_FRAMES[facing] ?? 0) : 0;
    const flip = facing === 'RIGHT' && sheet.height >= 48;
    const left = Number(x) * STEP;
    const top = Number(y) * STEP - SPRITE_LIFT;

    for (let sy = 0; sy < STEP; sy++) {
      for (let sx = 0; sx < STEP; sx++) {
        const value = sheet.sample(
          flip ? STEP - 1 - sx : sx,
          frame * STEP + sy,
        );
        const px = left + sx;
        const py = top + sy;

        if (value === 3 || px < 0 || py < 0) continue;
        if (px >= pixelWidth || py >= pixelHeight) continue;

        paint(px, py, SPRITE_SHADES[value]);
      }
    }
  });

  return { width: pixelWidth, height: pixelHeight, rgba };
};

const written = [];

for (const { name, out } of maps) {
  const [red, yellow] = games.map(({ dir }) => render(dir, name));

  mkdirSync(dirname(join(OUTPUT, out)), { recursive: true });
  writePng(join(OUTPUT, out), red.width, red.height, red.rgba);

  const variant = !red.rgba.equals(yellow.rgba);

  if (variant) {
    const target = join(games[1].outDir, out);

    mkdirSync(dirname(target), { recursive: true });
    writePng(target, yellow.width, yellow.height, yellow.rgba);
  }

  written.push(
    `${out} ${red.width}x${red.height}${variant ? ' (+ Yellow)' : ''}`,
  );
}

console.log(written.join('\n'));
