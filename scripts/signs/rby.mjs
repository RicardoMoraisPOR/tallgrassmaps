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
  PEWTER_CITY: 'pewter-city',
  PEWTER_GYM: 'pewter-city/pewter-gym',
  MUSEUM_1_F: 'pewter-city/pewter-museum',
  MUSEUM_2_F: 'pewter-city/pewter-museum',
  PEWTER_NIDORAN_HOUSE: 'pewter-city/pewter-nidoran-house',
  PEWTER_SPEECH_HOUSE: 'pewter-city/pewter-speech-house',
  PEWTER_MART: 'pewter-city/pewter-poke-mart',
  PEWTER_POKECENTER: 'pewter-city/pewter-pokemon-center',
  ROUTE_3: 'route-3',
  ROUTE_4: 'route-4',
  MT_MOON_POKECENTER: 'route-4/mt-moon-pokemon-center',
  MT_MOON_1_F: 'route-4/mt-moon',
  MT_MOON_B_1_F: 'route-4/mt-moon',
  MT_MOON_B_2_F: 'route-4/mt-moon',
  CERULEAN_CITY: 'cerulean-city',
  CERULEAN_GYM: 'cerulean-city/cerulean-gym',
  CERULEAN_TRADE_HOUSE: 'cerulean-city/cerulean-trade-house',
  CERULEAN_MELANIES_HOUSE: 'cerulean-city/cerulean-trade-house',
  BIKE_SHOP: 'cerulean-city/bike-shop',
  CERULEAN_BADGE_HOUSE: 'cerulean-city/cerulean-badge-house',
  CERULEAN_TRASHED_HOUSE: 'cerulean-city/cerulean-trashed-house',
  CERULEAN_MART: 'cerulean-city/cerulean-poke-mart',
  CERULEAN_POKECENTER: 'cerulean-city/cerulean-pokemon-center',
  ROUTE_24: 'route-24',
  ROUTE_25: 'route-25',
  BILLS_HOUSE: 'route-25/bills-house',
  ROUTE_5: 'route-5',
  ROUTE_5_GATE: 'route-5/route-5-gate',
  UNDERGROUND_PATH_ROUTE_5: 'route-5/underground-path-route-5',
  DAYCARE: 'route-5/daycare',
  UNDERGROUND_PATH_ROUTE_6: 'route-6/underground-path-route-6',
  ROUTE_6: 'route-6',
  ROUTE_6_GATE: 'route-6/route-6-gate',
  VERMILION_CITY: 'vermilion-city',
  VERMILION_GYM: 'vermilion-city/vermilion-gym',
  VERMILION_TRADE_HOUSE: 'vermilion-city/vermilion-trade-house',
  POKEMON_FAN_CLUB: 'vermilion-city/pokemon-fan-club',
  VERMILION_PIDGEY_HOUSE: 'vermilion-city/vermilion-pidgey-house',
  VERMILION_OLD_ROD_HOUSE: 'vermilion-city/vermilion-old-rod-house',
  VERMILION_MART: 'vermilion-city/vermilion-poke-mart',
  VERMILION_POKECENTER: 'vermilion-city/vermilion-pokemon-center',
  UNDERGROUND_PATH_NORTH_SOUTH: 'route-5/underground-path-north-south',
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
