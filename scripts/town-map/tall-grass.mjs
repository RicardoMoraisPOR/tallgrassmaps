import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { readPng } from '../lib/png.mjs';
import { regions } from './regions.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const OUTPUT_DIR = new URL('../../src/data/maps/tall-grass/', import.meta.url);

const ROUTE_KINDS = new Set(['path', 'town', 'place', 'sea']);
const LAND_KINDS = new Set(['land', 'path', 'town', 'place']);

const sameColor = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

const halves = {
  bl: (x, y) => y > x,
  tr: (x, y) => y < x,
  br: (x, y, last) => x + y > last,
  tl: (x, y, last) => x + y < last,
};

const triangles = {
  bl: (x, y, s) => `M${x} ${y}L${x} ${y + s}L${x + s} ${y + s}Z`,
  tr: (x, y, s) => `M${x} ${y}L${x + s} ${y}L${x + s} ${y + s}Z`,
  br: (x, y, s) => `M${x + s} ${y}L${x + s} ${y + s}L${x} ${y + s}Z`,
  tl: (x, y, s) => `M${x} ${y}L${x + s} ${y}L${x} ${y + s}Z`,
};

const classifyTile = (image, region, tileX, tileY) => {
  const { tileSize: size, colors } = region;
  const pixels = [];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      pixels.push({
        x,
        y,
        rgb: image.rgb(tileX * size + x, tileY * size + y),
      });
    }
  }

  const share = (color, list = pixels) =>
    list.filter((pixel) => sameColor(pixel.rgb, color)).length / list.length;

  const land = share(colors.land);
  const water = share(colors.water);
  const path = share(colors.path);
  const ink = share(colors.ink);

  if (region.headerRows.includes(tileY)) return { kind: 'header' };
  if (ink > 0.2 && water > 0.05) return { kind: 'town' };
  if (ink > 0.05 && path > 0.3 && water < 0.05) return { kind: 'place' };

  if (ink > 0.02 && water > 0.3) {
    const inked = pixels.filter((pixel) => sameColor(pixel.rgb, colors.ink));
    const middle = (value) => value >= size / 2 - 1 && value <= size / 2;
    const vertical = inked.filter((pixel) => middle(pixel.x)).length;
    const horizontal = inked.filter((pixel) => middle(pixel.y)).length;

    return { kind: 'sea', direction: vertical >= horizontal ? 'v' : 'h' };
  }

  if (path > 0.9) return { kind: 'path' };
  if (land > 0.9) return { kind: 'land' };
  if (water > 0.5 && land < 0.05) return { kind: 'water' };

  const half = Object.keys(halves).reduce((best, key) => {
    const inHalf = pixels.filter(({ x, y }) => halves[key](x, y, size - 1));
    const inBest = pixels.filter(({ x, y }) => halves[best](x, y, size - 1));

    return share(colors.land, inHalf) > share(colors.land, inBest) ? key : best;
  });

  return { kind: 'diagonal', half };
};

const linePath = (segments) =>
  segments.map(([x1, y1, x2, y2]) => `M${x1} ${y1}L${x2} ${y2}`).join('');

const classifyRegion = (region) => {
  const image = readPng(`${ROOT}${region.source}`);
  const size = region.tileSize;

  const grid = Array.from({ length: image.height / size }, (_, y) =>
    Array.from({ length: image.width / size }, (_, x) =>
      classifyTile(image, region, x, y),
    ),
  );

  return { image, grid };
};

const KIND_LETTERS = {
  header: '=',
  town: 'T',
  place: 'o',
  sea: '~',
  path: '#',
  land: '.',
  water: ' ',
  diagonal: '/',
};

const hex = (rgb) =>
  `#${rgb.map((value) => value.toString(16).padStart(2, '0')).join('')}`;

const inspect = (region) => {
  const { image, grid } = classifyRegion(region);
  const counts = new Map();

  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const key = image.rgb(x, y).join(',');

      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  console.log(`${region.id}: ${image.width}×${image.height}`);
  console.log('\nMost used colours (rgb, hex, pixels):');

  [...counts]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .forEach(([key, count]) => {
      const rgb = key.split(',').map(Number);

      console.log(`  [${key}]  ${hex(rgb)}  ${count}`);
    });

  console.log(
    '\nTiles: = header  T town  o place  # route  ~ sea route  . land  / coast  (space) water',
  );
  grid.forEach((row) =>
    console.log(`  |${row.map((tile) => KIND_LETTERS[tile.kind]).join('')}|`),
  );
};

const buildSvg = (region) => {
  const { image, grid } = classifyRegion(region);
  const size = region.tileSize;
  const half = size / 2;

  const land = [];
  const routes = [];
  const seaRoutes = [];
  const towns = [];
  const places = [];

  grid.forEach((row, y) =>
    row.forEach((tile, x) => {
      const left = x * size;
      const top = y * size;

      if (LAND_KINDS.has(tile.kind)) {
        land.push(`M${left} ${top}h${size}v${size}h-${size}Z`);
      }

      if (tile.kind === 'diagonal') {
        land.push(triangles[tile.half](left, top, size));
      }

      if (tile.kind === 'town') towns.push([left + half, top + half]);
      if (tile.kind === 'place') places.push([left + half, top + half]);

      if (!ROUTE_KINDS.has(tile.kind)) return;

      for (const [dx, dy] of [
        [1, 0],
        [0, 1],
      ]) {
        const neighbour = grid[y + dy]?.[x + dx];

        if (!neighbour || !ROUTE_KINDS.has(neighbour.kind)) continue;

        const segment = [
          left + half,
          top + half,
          (x + dx) * size + half,
          (y + dy) * size + half,
        ];
        const bySea = tile.kind === 'sea' || neighbour.kind === 'sea';

        (bySea ? seaRoutes : routes).push(segment);
      }
    }),
  );

  const patternId = `tg-water-${region.id}`;
  const landPath = land.join('');
  const townSize = size * 0.8125;
  const townRadius = size * 0.2;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${image.width} ${image.height}" class="tg-town-map">`,
    `<defs><pattern id="${patternId}" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.45" class="tg-water-dot"/></pattern></defs>`,
    `<rect width="${image.width}" height="${image.height}" class="tg-water"/>`,
    `<rect width="${image.width}" height="${image.height}" fill="url(#${patternId})"/>`,
    `<path d="${landPath}" class="tg-coast"/>`,
    `<path d="${landPath}" class="tg-land"/>`,
    `<path d="${linePath(routes)}" class="tg-route-under"/>`,
    `<path d="${linePath(routes)}" class="tg-route"/>`,
    `<path d="${linePath(seaRoutes)}" class="tg-sea-route"/>`,
    ...places.map(
      ([x, y]) =>
        `<circle cx="${x}" cy="${y}" r="${size * 0.2}" class="tg-place"/>`,
    ),
    ...towns.map(
      ([x, y]) =>
        `<rect x="${x - townSize / 2}" y="${y - townSize / 2}" width="${townSize}" height="${townSize}" rx="${townRadius}" class="tg-town"/>`,
    ),
    '</svg>',
    '',
  ].join('\n');
};

const args = process.argv.slice(2);
const inspecting = args.includes('--inspect');
const wanted = args.filter((arg) => arg !== '--inspect');
const selected = wanted.length
  ? regions.filter((region) => wanted.includes(region.id))
  : regions;

if (wanted.length && selected.length !== wanted.length) {
  throw new Error(
    `Unknown region. Known: ${regions.map(({ id }) => id).join(', ')}`,
  );
}

if (inspecting) {
  selected.forEach(inspect);
  process.exit(0);
}

mkdirSync(OUTPUT_DIR, { recursive: true });

for (const region of selected) {
  const output = new URL(`${region.id}.svg`, OUTPUT_DIR);

  writeFileSync(output, buildSvg(region));
  console.log(`Wrote src/data/maps/tall-grass/${region.id}.svg`);
}
