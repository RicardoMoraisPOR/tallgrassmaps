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
};

const OPENABLE_OBJECTS = [
  [/_POKEDEX\d*$/, 'pokedex'],
  [/_TOWN_MAP$/, 'town-map'],
];

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

    if (!hasOwnMapImage(game.dir, map, path, floor)) continue;

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
      const message = opens && mapText(game, file, textId);

      if (!message) continue;

      signs.push({
        game: game.id,
        path,
        ...(floor && { floor }),
        x: Number(x),
        y: Number(y),
        text: message,
        sprite: sprite.toLowerCase(),
        opens,
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
