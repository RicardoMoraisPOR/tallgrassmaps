import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { writePng } from '../lib/png.mjs';
import { pokeredDir, pokeyellowDir } from './disassembly.mjs';
import { mapTiles, TILE } from './map-tiles.mjs';

const OUTPUT = fileURLToPath(
  new URL('../../public/maps/rby/', import.meta.url),
);

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
    ['OaksLab', 'oaks-lab'],
    ['BluesHouse', 'blues-house'],
    ['RedsHouse1F', 'reds-house/1f'],
    ['RedsHouse2F', 'reds-house/2f'],
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

const render = (dir, name) => {
  const { tilesWide, tilesHigh, pixelWidth, pixelHeight, tileAt, shadeAt } =
    mapTiles(dir, name);
  const rgba = Buffer.alloc(pixelWidth * pixelHeight * 4);

  for (let tileY = 0; tileY < tilesHigh; tileY++) {
    for (let tileX = 0; tileX < tilesWide; tileX++) {
      const tile = tileAt(tileX, tileY);

      for (let y = 0; y < TILE; y++) {
        for (let x = 0; x < TILE; x++) {
          const i = ((tileY * TILE + y) * pixelWidth + tileX * TILE + x) * 4;
          const shade = shadeAt(tile, x, y);

          rgba[i] = shade;
          rgba[i + 1] = shade;
          rgba[i + 2] = shade;
          rgba[i + 3] = 255;
        }
      }
    }
  }

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
