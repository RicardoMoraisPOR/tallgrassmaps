import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { readPng, writePng } from '../lib/png.mjs';
import { pokeredDir, pokeyellowDir } from '../rby/disassembly.mjs';
import { mapTiles, TILE } from '../rby/map-tiles.mjs';

const OUTPUT = fileURLToPath(
  new URL('../../public/sprites/rby/overworld/', import.meta.url),
);
const STEP = 16;
const FRAMES = 3;
const SHADES = [0, 168, 248];
const TRANSPARENT = 3;

const sheet = (file) => {
  const source = readPng(file);
  const frames = source.height / STEP;
  const rgba = Buffer.alloc(STEP * STEP * FRAMES * 4);

  for (let frame = 0; frame < FRAMES; frame++) {
    const from = frames >= FRAMES ? frame : 0;

    for (let y = 0; y < STEP; y++) {
      for (let x = 0; x < STEP; x++) {
        const value = source.sample(x, from * STEP + y);

        if (value === TRANSPARENT) continue;

        const i = ((frame * STEP + y) * STEP + x) * 4;

        rgba[i] = SHADES[value];
        rgba[i + 1] = SHADES[value];
        rgba[i + 2] = SHADES[value];
        rgba[i + 3] = 255;
      }
    }
  }

  return rgba;
};

const spriteFiles = (dir) =>
  readdirSync(join(dir, 'gfx/sprites')).filter((file) => file.endsWith('.png'));

const redFiles = new Set(spriteFiles(pokeredDir));
const written = { red: 0, yellow: 0 };

mkdirSync(join(OUTPUT, 'yellow'), { recursive: true });

for (const file of redFiles) {
  writePng(
    join(OUTPUT, file),
    STEP,
    STEP * FRAMES,
    sheet(join(pokeredDir, 'gfx/sprites', file)),
  );
  written.red++;
}

for (const file of spriteFiles(pokeyellowDir)) {
  const yellow = join(pokeyellowDir, 'gfx/sprites', file);

  if (
    redFiles.has(file) &&
    readFileSync(yellow).equals(
      readFileSync(join(pokeredDir, 'gfx/sprites', file)),
    )
  ) {
    continue;
  }

  writePng(join(OUTPUT, 'yellow', file), STEP, STEP * FRAMES, sheet(yellow));
  written.yellow++;
}

const CUTOUTS = [
  {
    file: 'bench_guy.png',
    map: 'ViridianPokecenter',
    origin: [6, 64],
    rows: [
      [4, 8],
      [2, 9],
      [1, 10],
      [0, 11],
      [0, 11],
      [0, 10],
      [0, 10],
      [0, 10],
      [1, 10],
      [3, 9],
      [3, 9],
      [2, 9],
      [2, 10],
      [3, 11],
      [5, 10],
      [8, 9],
    ],
  },
];

const cutout = ({ map, origin: [left, top], rows }) => {
  const { tileAt, shadeAt } = mapTiles(pokeredDir, map);
  const rgba = Buffer.alloc(STEP * STEP * FRAMES * 4);

  rows.forEach(([from, to], y) => {
    for (let x = from; x <= to; x++) {
      const mapX = left + x;
      const mapY = top + y;
      const shade = shadeAt(
        tileAt(Math.floor(mapX / TILE), Math.floor(mapY / TILE)),
        mapX % TILE,
        mapY % TILE,
      );

      for (let frame = 0; frame < FRAMES; frame++) {
        const i = ((frame * STEP + y) * STEP + x) * 4;

        rgba[i] = shade;
        rgba[i + 1] = shade;
        rgba[i + 2] = shade;
        rgba[i + 3] = 255;
      }
    }
  });

  return rgba;
};

for (const entry of CUTOUTS) {
  writePng(join(OUTPUT, entry.file), STEP, STEP * FRAMES, cutout(entry));
  written.red++;
}

console.log(
  `Wrote ${written.red} Red/Blue and ${written.yellow} Yellow overworld sprites to ${OUTPUT}`,
);
