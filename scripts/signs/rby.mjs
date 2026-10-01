import { readdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import {
  constantFromFile,
  floorFor,
  forGame,
  games,
  hasOwnMapImage,
  read,
} from '../rby/disassembly.mjs';
import { mapText } from '../rby/text.mjs';

const OUTPUT = new URL('../../src/data/signs/rby.json', import.meta.url);

const SIGN_MAPS = {
  PALLET_TOWN: 'pallet-town',
  OAKS_LAB: 'pallet-town/oaks-lab',
  BLUES_HOUSE: 'pallet-town/blues-house',
  ROUTE_1: 'route-1',
  VIRIDIAN_CITY: 'viridian-city',
  VIRIDIAN_POKECENTER: 'viridian-city/viridian-pokemon-center',
  VIRIDIAN_MART: 'viridian-city/viridian-poke-mart',
  VIRIDIAN_GYM: 'viridian-city/viridian-gym',
  VIRIDIAN_SCHOOL_HOUSE: 'viridian-city/viridian-school-house',
  VIRIDIAN_NICKNAME_HOUSE: 'viridian-city/viridian-nickname-house',
  ROUTE_2: 'route-2',
  ROUTE_2_GATE: 'route-2/route-2-gate',
  ROUTE_2_TRADE_HOUSE: 'route-2/route-2-trade-house',
  VIRIDIAN_FOREST_NORTH_GATE: 'route-2/viridian-forest-north-gate',
  VIRIDIAN_FOREST_SOUTH_GATE: 'route-2/viridian-forest-south-gate',
  DIGLETTS_CAVE_ROUTE_2: 'route-2/digletts-cave-route-2',
  DIGLETTS_CAVE_ROUTE_11: 'route-11/digletts-cave-route-11',
  VIRIDIAN_FOREST: 'route-2/viridian-forest',
};

const OPENABLE_OBJECTS = [
  [/_POKEDEX\d*$/, 'pokedex'],
  [/_TOWN_MAP$/, 'town-map'],
];

const READABLE_SPRITES = new Set(['CLIPBOARD', 'PAPER']);

const opensFor = (textId) =>
  OPENABLE_OBJECTS.find(([pattern]) => pattern.test(textId))?.[1];

const signs = [];

for (const game of games) {
  for (const fileName of readdirSync(join(game.dir, 'data/maps/objects'))) {
    const file = basename(fileName, '.asm');
    const map = constantFromFile(file);

    const path = SIGN_MAPS[map];

    if (!path) continue;

    const floor = floorFor(map);

    if (!hasOwnMapImage(game.dir, map, path, floor, true)) continue;

    const text = forGame(
      read(game.dir, `data/maps/objects/${fileName}`),
      game.define,
    ).join('\n');

    for (const [, x, y, textId] of text.matchAll(
      /^bg_event\s+(\d+),\s*(\d+),\s*TEXT_(\w+)$/gm,
    )) {
      const message = mapText(game, file, textId);

      if (!message) continue;

      signs.push({
        game: game.id,
        path,
        ...(floor && { floor }),
        x: Number(x),
        y: Number(y),
        text: message,
      });
    }

    for (const [, x, y, sprite, textId] of text.matchAll(
      /^object_event\s+(\d+),\s*(\d+),\s*SPRITE_(\w+),.*TEXT_(\w+)(?:,.*)?$/gm,
    )) {
      const opens = opensFor(textId);
      const message =
        (opens || READABLE_SPRITES.has(sprite)) && mapText(game, file, textId);

      if (!message) continue;

      signs.push({
        game: game.id,
        path,
        ...(floor && { floor }),
        x: Number(x),
        y: Number(y),
        text: message,
        sprite: sprite.toLowerCase(),
        ...(opens && { opens }),
      });
    }
  }
}

const merged = new Map();

for (const { game, ...sign } of signs) {
  const key = JSON.stringify(sign);
  const current = merged.get(key) ?? { ...sign, games: [] };

  current.games.push(game);
  merged.set(key, current);
}

const output = [...merged.values()];

writeFileSync(OUTPUT, `${JSON.stringify(output, null, 2)}\n`);

console.log(`Wrote ${output.length} signs to ${OUTPUT.pathname}`);
