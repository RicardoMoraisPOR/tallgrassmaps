import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

import { readPng, writePng } from '../lib/png.mjs';
import {
  forGame,
  pokeredDir,
  pokeyellowDir,
  read,
} from '../rby/disassembly.mjs';

const OUTPUT = new URL('../../public/sprites/pokemon/', import.meta.url);
const BOX = 56;

const spriteSets = [
  { id: 'red-blue', dir: pokeredDir, define: '_RED' },
  { id: 'yellow', dir: pokeyellowDir, define: '_YELLOW' },
];

const fileNames = { MR_MIME: 'mr.mime' };

const lines = (set, file) => forGame(read(set.dir, file), set.define);

const dexSpecies = (set) =>
  lines(set, 'constants/pokedex_constants.asm').flatMap((line) => {
    const match = line.match(/^const DEX_(\w+)$/);

    return match ? [match[1]] : [];
  });

const toRgb8 = (value) => (value << 3) | (value >> 2);

const superPalettes = (set) => {
  const names = lines(set, 'constants/palette_constants.asm').flatMap(
    (line) => {
      const match = line.match(/^const (PAL_\w+)$/);

      return match ? [match[1]] : [];
    },
  );
  const table = lines(set, 'data/sgb/sgb_palettes.asm');
  const start = table.indexOf('SuperPalettes:') + 1;
  const end = table.findIndex((line, i) => i >= start && /^\w+:/.test(line));
  const colors = table
    .slice(start, end === -1 ? undefined : end)
    .filter((line) => line.startsWith('RGB '))
    .map((line) => {
      const values = line.slice(4).split(',').map(Number);

      return [0, 3, 6, 9].map((i) => values.slice(i, i + 3).map(toRgb8));
    });

  if (names.length !== colors.length) {
    throw new Error(
      `${set.id}: ${names.length} palette names but ${colors.length} palettes`,
    );
  }

  return new Map(names.map((name, i) => [name, colors[i]]));
};

const monsterPalettes = (set) =>
  lines(set, 'data/pokemon/palettes.asm')
    .flatMap((line) => {
      const match = line.match(/^db (PAL_\w+)$/);

      return match ? [match[1]] : [];
    })
    .slice(1);

const outsideWhite = (image) => {
  const white = (1 << image.bitDepth) - 1;
  const seen = new Set();
  const stack = [];

  for (let x = 0; x < image.width; x++)
    stack.push([x, 0], [x, image.height - 1]);
  for (let y = 0; y < image.height; y++)
    stack.push([0, y], [image.width - 1, y]);

  while (stack.length > 0) {
    const [x, y] = stack.pop();
    const key = y * image.width + x;

    if (x < 0 || y < 0 || x >= image.width || y >= image.height) continue;
    if (seen.has(key) || image.sample(x, y) !== white) continue;

    seen.add(key);
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  return seen;
};

const renderSprite = (image, palette) => {
  const white = (1 << image.bitDepth) - 1;
  const transparent = outsideWhite(image);
  const rgba = Buffer.alloc(BOX * BOX * 4);
  const left = Math.floor((BOX - image.width) / 2);
  const top = BOX - image.height;

  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      if (transparent.has(y * image.width + x)) continue;

      const [r, g, b] = palette[white - image.sample(x, y)];
      const i = ((top + y) * BOX + left + x) * 4;

      rgba[i] = r;
      rgba[i + 1] = g;
      rgba[i + 2] = b;
      rgba[i + 3] = 255;
    }
  }

  return rgba;
};

for (const set of spriteSets) {
  const species = dexSpecies(set);
  const palettes = superPalettes(set);
  const assigned = monsterPalettes(set);
  const output = new URL(`${set.id}/`, OUTPUT);

  if (species.length !== 151 || assigned.length !== 151) {
    throw new Error(
      `${set.id}: expected 151 species and palettes, got ${species.length} and ${assigned.length}`,
    );
  }

  mkdirSync(output, { recursive: true });

  species.forEach((name, index) => {
    const file = fileNames[name] ?? name.toLowerCase().replaceAll('_', '');
    const source = join(set.dir, `gfx/pokemon/front/${file}.png`);

    if (!existsSync(source)) throw new Error(`${set.id}: missing ${source}`);

    const palette = palettes.get(assigned[index]);

    writePng(
      new URL(`${index + 1}.png`, output),
      BOX,
      BOX,
      renderSprite(readPng(source), palette),
    );
  });

  console.log(`Wrote 151 sprites to public/sprites/pokemon/${set.id}/`);
}
