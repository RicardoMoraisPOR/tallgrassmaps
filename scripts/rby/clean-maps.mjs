import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { readPng, writePng } from '../lib/png.mjs';
import { pokeredDir, pokeyellowDir } from './disassembly.mjs';
import {
  BACKGROUND_SHADES,
  mapHeaders,
  mapObjects,
  mapTiles,
  TILE,
} from './map-tiles.mjs';

const IMAGES = fileURLToPath(
  new URL('../../public/maps/rby/', import.meta.url),
);
const STEP = 16;
const SPRITE_LIFT = 4;
const YELLOW = 'variants/yellow/';
const EVENTS = 'events/';

const groupPrefixes = {
  'mt-moon': 'MTMOON',
  'cerulean-cave': 'CERULEANCAVE',
  'pokemon-tower': 'POKEMONTOWER',
  'rocket-game-corner': 'ROCKETHIDEOUT',
  'silph-co': 'SILPHCO',
  'safari-zone': 'SAFARIZONE',
  'pokemon-mansion': 'POKEMONMANSION',
  'seafoam-islands': 'SEAFOAMISLANDS',
  'victory-road': 'VICTORYROAD',
  'rock-tunnel': 'ROCKTUNNEL',
  'celadon-dept-store': 'CELADONMART',
};

const namedMaps = { 'rocket-game-corner/game-corner': 'GAMECORNER' };

const snap = (value) =>
  BACKGROUND_SHADES.reduce((best, shade) =>
    Math.abs(shade - value) < Math.abs(best - value) ? shade : best,
  );

const compact = (id) => id.toUpperCase().replaceAll('-', '');

const mapKey = (path) => {
  if (namedMaps[path]) return namedMaps[path];

  const [place, floor] = path.split('/');
  const key = floor
    ? (groupPrefixes[place] ?? compact(place)) + compact(floor)
    : compact(place);

  return key.replace('POKEMONCENTER', 'POKECENTER').replace('POKEMART', 'MART');
};

const images = (dir) =>
  readdirSync(dir).flatMap((file) => {
    const path = join(dir, file);

    return statSync(path).isDirectory() ? images(path) : [path];
  });

const headers = {
  red: mapHeaders(pokeredDir),
  yellow: mapHeaders(pokeyellowDir),
};

const coveredTiles = (objects) => {
  const covered = new Set();

  for (const { x, y } of objects) {
    const top = y * STEP - SPRITE_LIFT;

    for (
      let tileY = Math.floor(top / TILE);
      tileY * TILE < top + STEP;
      tileY++
    ) {
      for (
        let tileX = (x * STEP) / TILE;
        tileX * TILE < x * STEP + STEP;
        tileX++
      ) {
        if (tileY >= 0) covered.add(`${tileX},${tileY}`);
      }
    }
  }

  return covered;
};

const clean = (file) => {
  const path = relative(IMAGES, file).replace(/\.png$/, '');
  const yellow = path.startsWith(YELLOW);
  const place = path.replace(YELLOW, '').replace(EVENTS, '');
  const dir = yellow ? pokeyellowDir : pokeredDir;
  const name = headers[yellow ? 'yellow' : 'red'].get(mapKey(place));

  if (!name) return undefined;

  const layout = mapTiles(dir, name);
  const image = readPng(file);

  if (
    image.width !== layout.pixelWidth ||
    image.height !== layout.pixelHeight
  ) {
    return undefined;
  }

  const covered = coveredTiles(mapObjects(dir, name));
  const tileKey = (tileX, tileY) => `${tileX},${tileY}`;
  const pixels = (tileX, tileY) =>
    Array.from({ length: TILE * TILE }, (_, index) => {
      const [value] = image.rgb(
        tileX * TILE + (index % TILE),
        tileY * TILE + Math.floor(index / TILE),
      );

      return snap(value);
    });

  const donors = new Map();

  for (let tileY = 0; tileY < layout.tilesHigh; tileY++) {
    for (let tileX = 0; tileX < layout.tilesWide; tileX++) {
      if (covered.has(tileKey(tileX, tileY))) continue;

      const tile = layout.tileAt(tileX, tileY);
      const pattern = pixels(tileX, tileY).join(',');
      const counts = donors.get(tile) ?? new Map();

      counts.set(pattern, (counts.get(pattern) ?? 0) + 1);
      donors.set(tile, counts);
    }
  }

  const donorFor = (tile) => {
    const counts = donors.get(tile);

    if (!counts) {
      return Array.from({ length: TILE * TILE }, (_, index) =>
        layout.shadeAt(tile, index % TILE, Math.floor(index / TILE)),
      );
    }

    const [pattern] = [...counts].sort((a, b) => b[1] - a[1])[0];

    return pattern.split(',').map(Number);
  };

  const tilePattern = (tile) =>
    Array.from({ length: TILE * TILE }, (_, index) =>
      layout.shadeAt(tile, index % TILE, Math.floor(index / TILE)),
    ).join(',');
  const known = new Set(
    Array.from({ length: layout.tileCount }, (_, tile) => tilePattern(tile)),
  );

  for (const counts of donors.values()) {
    known.add([...counts].sort((a, b) => b[1] - a[1])[0][0]);
  }

  for (let tileY = 0; tileY < layout.tilesHigh; tileY++) {
    for (let tileX = 0; tileX < layout.tilesWide; tileX++) {
      if (!known.has(pixels(tileX, tileY).join(','))) {
        covered.add(tileKey(tileX, tileY));
      }
    }
  }

  let changed = 0;
  const rgba = Buffer.alloc(image.width * image.height * 4);

  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const [value] = image.rgb(x, y);
      const shade = snap(value);
      const i = (y * image.width + x) * 4;

      rgba[i] = shade;
      rgba[i + 1] = shade;
      rgba[i + 2] = shade;
      rgba[i + 3] = 255;
      if (shade !== value) changed++;
    }
  }

  for (const key of covered) {
    const [tileX, tileY] = key.split(',').map(Number);

    if (tileX >= layout.tilesWide || tileY >= layout.tilesHigh) continue;

    const donor = donorFor(layout.tileAt(tileX, tileY));

    donor.forEach((shade, index) => {
      const x = tileX * TILE + (index % TILE);
      const y = tileY * TILE + Math.floor(index / TILE);
      const i = (y * image.width + x) * 4;

      if (rgba[i] === shade) return;

      rgba[i] = shade;
      rgba[i + 1] = shade;
      rgba[i + 2] = shade;
      changed++;
    });
  }

  if (changed > 0) writePng(file, image.width, image.height, rgba);

  return { path, changed };
};

const results = images(IMAGES)
  .filter((file) => file.endsWith('.png'))
  .map((file) => [relative(IMAGES, file), clean(file)]);

const skipped = results.filter(([, result]) => !result).map(([path]) => path);
const cleaned = results.filter(([, result]) => result?.changed > 0);

console.log(`Cleaned ${cleaned.length} images`);
console.log(`Skipped (no matching pret map): ${skipped.join(', ')}`);
