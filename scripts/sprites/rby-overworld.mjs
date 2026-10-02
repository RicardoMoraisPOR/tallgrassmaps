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
  {
    file: 'hall_of_fame_computer.png',
    map: 'HallOfFame',
    origin: [64, 15],
    width: 32,
    height: 23,
    rows: [
      ...Array.from({ length: 20 }, () => [0, 31]),
      ...Array.from({ length: 3 }, () => [1, 30]),
    ],
  },
];

const cutout = ({
  map,
  origin: [left, top],
  width = STEP,
  height = STEP,
  rows,
}) => {
  const { tileAt, shadeAt } = mapTiles(pokeredDir, map);
  const rgba = Buffer.alloc(width * height * FRAMES * 4);

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
        const i = ((frame * height + y) * width + x) * 4;

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
  const { width = STEP, height = STEP } = entry;

  writePng(join(OUTPUT, entry.file), width, height * FRAMES, cutout(entry));
  written.red++;
}

const PICTURE_SIZE = 48;
const SHRINK = PICTURE_SIZE / STEP;
const LIGHT = 2;
const NEIGHBOURS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

const ghost = () => {
  const source = readPng(join(pokeredDir, 'gfx/battle/ghost.png'));
  const isLight = (x, y) => source.sample(x, y) >= LIGHT;
  const background = new Set();
  const queue = [];
  const visit = (x, y) => {
    const key = `${x},${y}`;

    if (x < 0 || y < 0 || x >= PICTURE_SIZE || y >= PICTURE_SIZE) return;
    if (!isLight(x, y) || background.has(key)) return;

    background.add(key);
    queue.push([x, y]);
  };

  for (let i = 0; i < PICTURE_SIZE; i++) {
    visit(i, 0);
    visit(i, PICTURE_SIZE - 1);
    visit(0, i);
    visit(PICTURE_SIZE - 1, i);
  }

  while (queue.length > 0) {
    const [x, y] = queue.pop();

    for (const [dx, dy] of NEIGHBOURS) visit(x + dx, y + dy);
  }

  const blockCount = SHRINK ** 2;
  const cells = Array.from({ length: STEP }, (_, y) =>
    Array.from({ length: STEP }, (_, x) => {
      let outside = 0;
      let light = 0;

      for (let dy = 0; dy < SHRINK; dy++) {
        for (let dx = 0; dx < SHRINK; dx++) {
          const px = x * SHRINK + dx;
          const py = y * SHRINK + dy;

          if (background.has(`${px},${py}`)) outside++;
          else if (isLight(px, py)) light++;
        }
      }

      if (outside * 2 > blockCount) return 'outside';
      if (light * 3 >= blockCount) return 'light';
      if (outside + light < blockCount) return 'dark';

      return 'outside';
    }),
  );
  const touchesOutside = (x, y) =>
    NEIGHBOURS.some(
      ([dx, dy]) => (cells[y + dy]?.[x + dx] ?? 'outside') === 'outside',
    );
  const shades = { light: 248, dark: 0 };
  const rgba = Buffer.alloc(STEP * STEP * FRAMES * 4);

  for (let y = 0; y < STEP; y++) {
    for (let x = 0; x < STEP; x++) {
      const cell = cells[y][x];

      if (cell === 'outside') continue;
      if (cell === 'light' && touchesOutside(x, y)) continue;

      for (let frame = 0; frame < FRAMES; frame++) {
        const i = ((frame * STEP + y) * STEP + x) * 4;

        rgba[i] = shades[cell];
        rgba[i + 1] = shades[cell];
        rgba[i + 2] = shades[cell];
        rgba[i + 3] = 255;
      }
    }
  }

  return rgba;
};

writePng(join(OUTPUT, 'ghost.png'), STEP, STEP * FRAMES, ghost());
written.red++;

console.log(
  `Wrote ${written.red} Red/Blue and ${written.yellow} Yellow overworld sprites to ${OUTPUT}`,
);
