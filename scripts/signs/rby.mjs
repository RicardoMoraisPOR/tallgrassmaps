import { readdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import {
  constantFromFile,
  displayName,
  floorFor,
  forGame,
  games,
  hasOwnMapImage,
  read,
} from '../rby/disassembly.mjs';
import { farText, mapText } from '../rby/text.mjs';

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
  ROUTE_11: 'route-11',
  ROUTE_11_GATE_2_F: 'route-11/route-11-gate',
  ROUTE_13: 'route-13',
  ROUTE_14: 'route-14',
  ROUTE_15: 'route-15',
  ROUTE_15_GATE_1_F: 'route-15/route-15-gate',
  ROUTE_15_GATE_2_F: 'route-15/route-15-gate',
  ROUTE_16: 'route-16',
  ROUTE_16_GATE_1_F: 'route-16/route-16-gate',
  ROUTE_16_GATE_2_F: 'route-16/route-16-gate',
  ROUTE_16_FLY_HOUSE: 'route-16/route-16-fly-house',
  ROUTE_17: 'route-17',
  ROUTE_18: 'route-18',
  ROUTE_18_GATE_1_F: 'route-18/route-18-gate',
  ROUTE_18_GATE_2_F: 'route-18/route-18-gate',
  ROUTE_9: 'route-9',
  ROUTE_10: 'route-10',
  ROCK_TUNNEL_POKECENTER: 'route-10/rock-tunnel-pokemon-center',
  ROCK_TUNNEL_1_F: 'route-10/rock-tunnel',
  ROCK_TUNNEL_B_1_F: 'route-10/rock-tunnel',
  POWER_PLANT: 'route-10/power-plant',
  ROUTE_12: 'route-12',
  LAVENDER_TOWN: 'lavender-town',
  MR_FUJIS_HOUSE: 'lavender-town/mr-fujis-house',
  ROUTE_12_GATE_2_F: 'route-12/route-12-gate',
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
  ROUTE_22: 'route-22',
  ROUTE_22_GATE: 'route-22/route-22-gate',
  ROUTE_23: 'route-23',
  VICTORY_ROAD_1_F: 'route-23/victory-road',
  VICTORY_ROAD_2_F: 'route-23/victory-road',
  VICTORY_ROAD_3_F: 'route-23/victory-road',
  HALL_OF_FAME: 'indigo-plateau/pokemon-league',
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
  ROUTE_7: 'route-7',
  ROUTE_7_GATE: 'route-7/route-7-gate',
  UNDERGROUND_PATH_ROUTE_7: 'route-7/underground-path-route-7',
  ROUTE_8: 'route-8',
  ROUTE_8_GATE: 'route-8/route-8-gate',
  UNDERGROUND_PATH_ROUTE_8: 'route-8/underground-path-route-8',
  UNDERGROUND_PATH_WEST_EAST: 'route-8/underground-path-west-east',
  VERMILION_CITY: 'vermilion-city',
  VERMILION_GYM: 'vermilion-city/vermilion-gym',
  VERMILION_TRADE_HOUSE: 'vermilion-city/vermilion-trade-house',
  POKEMON_FAN_CLUB: 'vermilion-city/pokemon-fan-club',
  VERMILION_PIDGEY_HOUSE: 'vermilion-city/vermilion-pidgey-house',
  VERMILION_OLD_ROD_HOUSE: 'vermilion-city/vermilion-old-rod-house',
  VERMILION_MART: 'vermilion-city/vermilion-poke-mart',
  VERMILION_POKECENTER: 'vermilion-city/vermilion-pokemon-center',
  VERMILION_DOCK: 'vermilion-city/ss-anne',
  SS_ANNE_1_F: 'vermilion-city/ss-anne',
  SS_ANNE_1_F_ROOMS: 'vermilion-city/ss-anne',
  SS_ANNE_2_F: 'vermilion-city/ss-anne',
  SS_ANNE_2_F_ROOMS: 'vermilion-city/ss-anne',
  SS_ANNE_3_F: 'vermilion-city/ss-anne',
  SS_ANNE_BOW: 'vermilion-city/ss-anne',
  SS_ANNE_B_1_F: 'vermilion-city/ss-anne',
  SS_ANNE_B_1_F_ROOMS: 'vermilion-city/ss-anne',
  SS_ANNE_KITCHEN: 'vermilion-city/ss-anne',
  SS_ANNE_CAPTAINS_ROOM: 'vermilion-city/ss-anne',
  CELADON_CITY: 'celadon-city',
  CELADON_POKECENTER: 'celadon-city/celadon-pokemon-center',
  CELADON_GYM: 'celadon-city/celadon-gym',
  CELADON_DINER: 'celadon-city/celadon-diner',
  CELADON_HOTEL: 'celadon-city/celadon-hotel',
  CELADON_CHIEF_HOUSE: 'celadon-city/celadon-chief-house',
  GAME_CORNER_PRIZE_ROOM: 'celadon-city/game-corner-prize-room',
  CELADON_MART_1_F: 'celadon-city/celadon-dept-store',
  CELADON_MART_2_F: 'celadon-city/celadon-dept-store',
  CELADON_MART_3_F: 'celadon-city/celadon-dept-store',
  CELADON_MART_4_F: 'celadon-city/celadon-dept-store',
  CELADON_MART_5_F: 'celadon-city/celadon-dept-store',
  CELADON_MART_ROOF: 'celadon-city/celadon-dept-store',
  CELADON_MART_ELEVATOR: 'celadon-city/celadon-dept-store',
  CELADON_MANSION_1_F: 'celadon-city/celadon-mansion',
  CELADON_MANSION_2_F: 'celadon-city/celadon-mansion',
  CELADON_MANSION_3_F: 'celadon-city/celadon-mansion',
  CELADON_MANSION_ROOF: 'celadon-city/celadon-mansion',
  CELADON_MANSION_ROOF_HOUSE: 'celadon-city/celadon-mansion',
  GAME_CORNER: 'celadon-city/rocket-game-corner',
  ROCKET_HIDEOUT_B_1_F: 'celadon-city/rocket-game-corner',
  ROCKET_HIDEOUT_B_2_F: 'celadon-city/rocket-game-corner',
  ROCKET_HIDEOUT_B_3_F: 'celadon-city/rocket-game-corner',
  ROCKET_HIDEOUT_B_4_F: 'celadon-city/rocket-game-corner',
  ROCKET_HIDEOUT_ELEVATOR: 'celadon-city/rocket-game-corner',
  SAFFRON_CITY: 'saffron-city',
  SAFFRON_POKECENTER: 'saffron-city/saffron-pokemon-center',
  SAFFRON_MART: 'saffron-city/saffron-poke-mart',
  SAFFRON_GYM: 'saffron-city/saffron-gym',
  FIGHTING_DOJO: 'saffron-city/fighting-dojo',
  COPYCATS_HOUSE_1_F: 'saffron-city/copycats-house',
  COPYCATS_HOUSE_2_F: 'saffron-city/copycats-house',
  SAFFRON_PIDGEY_HOUSE: 'saffron-city/saffron-pidgey-house',
  MR_PSYCHICS_HOUSE: 'saffron-city/mr-psychics-house',
  SILPH_CO_1_F: 'saffron-city/silph-co',
  SILPH_CO_2_F: 'saffron-city/silph-co',
  SILPH_CO_3_F: 'saffron-city/silph-co',
  SILPH_CO_4_F: 'saffron-city/silph-co',
  SILPH_CO_5_F: 'saffron-city/silph-co',
  SILPH_CO_6_F: 'saffron-city/silph-co',
  SILPH_CO_7_F: 'saffron-city/silph-co',
  SILPH_CO_8_F: 'saffron-city/silph-co',
  SILPH_CO_9_F: 'saffron-city/silph-co',
  SILPH_CO_10_F: 'saffron-city/silph-co',
  SILPH_CO_11_F: 'saffron-city/silph-co',
  SILPH_CO_ELEVATOR: 'saffron-city/silph-co',
  CINNABAR_ISLAND: 'cinnabar-island',
  CINNABAR_GYM: 'cinnabar-island/cinnabar-gym',
  CINNABAR_LAB: 'cinnabar-island/cinnabar-lab',
  CINNABAR_LAB_TRADE_ROOM: 'cinnabar-island/cinnabar-lab',
  CINNABAR_LAB_METRONOME_ROOM: 'cinnabar-island/cinnabar-lab',
  CINNABAR_LAB_FOSSIL_ROOM: 'cinnabar-island/cinnabar-lab',
  CINNABAR_MART: 'cinnabar-island/cinnabar-poke-mart',
  CINNABAR_POKECENTER: 'cinnabar-island/cinnabar-pokemon-center',
  POKEMON_MANSION_1_F: 'cinnabar-island/pokemon-mansion',
  POKEMON_MANSION_2_F: 'cinnabar-island/pokemon-mansion',
  POKEMON_MANSION_3_F: 'cinnabar-island/pokemon-mansion',
  POKEMON_MANSION_B_1_F: 'cinnabar-island/pokemon-mansion',
  ROUTE_19: 'route-19',
  SUMMER_BEACH_HOUSE: 'route-19/summer-beach-house',
  ROUTE_20: 'route-20',
  SEAFOAM_ISLANDS_1_F: 'route-20/seafoam-islands',
  SEAFOAM_ISLANDS_B_1_F: 'route-20/seafoam-islands',
  SEAFOAM_ISLANDS_B_2_F: 'route-20/seafoam-islands',
  SEAFOAM_ISLANDS_B_3_F: 'route-20/seafoam-islands',
  SEAFOAM_ISLANDS_B_4_F: 'route-20/seafoam-islands',
  FUCHSIA_CITY: 'fuchsia-city',
  FUCHSIA_GYM: 'fuchsia-city/fuchsia-gym',
  FUCHSIA_MART: 'fuchsia-city/fuchsia-poke-mart',
  FUCHSIA_POKECENTER: 'fuchsia-city/fuchsia-pokemon-center',
  FUCHSIA_MEETING_ROOM: 'fuchsia-city/fuchsia-meeting-room',
  FUCHSIA_GOOD_ROD_HOUSE: 'fuchsia-city/fuchsia-good-rod-house',
  FUCHSIA_BILLS_GRANDPAS_HOUSE: 'fuchsia-city/fuchsia-bills-grandpas-house',
  WARDENS_HOUSE: 'fuchsia-city/wardens-house',
  SAFARI_ZONE_GATE: 'fuchsia-city/safari-zone-gate',
  SAFARI_ZONE_CENTER: 'fuchsia-city/safari-zone',
  SAFARI_ZONE_EAST: 'fuchsia-city/safari-zone',
  SAFARI_ZONE_NORTH: 'fuchsia-city/safari-zone',
  SAFARI_ZONE_WEST: 'fuchsia-city/safari-zone',
  SAFARI_ZONE_CENTER_REST_HOUSE: 'fuchsia-city/safari-zone',
  SAFARI_ZONE_EAST_REST_HOUSE: 'fuchsia-city/safari-zone',
  SAFARI_ZONE_NORTH_REST_HOUSE: 'fuchsia-city/safari-zone',
  SAFARI_ZONE_WEST_REST_HOUSE: 'fuchsia-city/safari-zone',
  SAFARI_ZONE_SECRET_HOUSE: 'fuchsia-city/safari-zone',
  UNDERGROUND_PATH_NORTH_SOUTH: 'route-5/underground-path-north-south',
};

const fossilSign = (game) =>
  [
    farText(game, '_FuchsiaCityFossilSignUndeterminedText'),
    `After you take the Dome Fossil:\n\n${farText(game, '_FuchsiaCityFossilSignOmanyteText')}`,
    `After you take the Helix Fossil:\n\n${farText(game, '_FuchsiaCityFossilSignKabutoText')}`,
  ].join('\n\n');

const constantName = (constant) => constant.replaceAll('_', ' ');

const vendingMachine = (game) => {
  const menu = [
    ...read(game.dir, 'data/items/vending_prices.asm').matchAll(
      /vend_item (\w+),\s*(\d+)/g,
    ),
  ].map(([, item, price]) => `${constantName(item)} ¥${price}`);

  return `${farText(game, '_VendingMachineText1')}\n\n${menu.join('\n')}`;
};

const machineNumbers = (game) =>
  new Map(
    [
      ...read(game.dir, 'constants/item_constants.asm').matchAll(
        /^\s*add_tm (\w+)/gm,
      ),
    ].map(([, move], index) => [
      `TM_${move}`,
      `TM${String(index + 1).padStart(2, '0')}`,
    ]),
  );

const prizeSections = (game) => {
  const sections = new Map();
  let current;

  for (const line of forGame(
    read(game.dir, 'data/events/prizes.asm'),
    game.define,
  )) {
    current = line.match(/^(PrizeMenu\w+):$/)?.[1] ?? current;

    const value = line.match(/^(?:db|bcd2) ([A-Z_]+|\d+)$/)?.[1];

    if (current && value)
      sections.set(current, [...(sections.get(current) ?? []), value]);
  }

  return sections;
};

const prizeLevels = (game) =>
  new Map(
    forGame(
      read(game.dir, 'data/events/prize_mon_levels.asm'),
      game.define,
    ).flatMap((line) => {
      const [, species, level] = line.match(/^db (\w+),\s*(\d+)$/) ?? [];

      return species ? [[species, level]] : [];
    }),
  );

const dexNumbers = (game) =>
  new Map(
    [
      ...read(game.dir, 'constants/pokedex_constants.asm').matchAll(
        /const DEX_(\w+)\s*; (\d+)/g,
      ),
    ].map(([, constant, number]) => [constant, Number(number)]),
  );

const titleCase = (constant) =>
  constant
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');

const prizeMenu = (game, menu) => {
  const sections = prizeSections(game);
  const levels = prizeLevels(game);
  const machines = machineNumbers(game);
  const costs = sections.get(`PrizeMenu${menu}Cost`);

  return sections.get(`PrizeMenu${menu}Entries`).map((prize, index) => ({
    prize,
    machine: machines.get(prize),
    level: levels.get(prize),
    coins: Number(costs[index]),
  }));
};

const prizeVendor = (menu) => (game) => {
  const prizes = prizeMenu(game, menu).map(
    ({ prize, machine, level, coins }) =>
      `${machine ? `${machine} ${constantName(prize.slice(3))}` : `${constantName(prize)} L${level}`} ${coins} coins`,
  );

  return `${farText(game, '_WhichPrizeText')}\n\n${prizes.join('\n')}`;
};

const PRIZE_VENDORS = {
  GAMECORNERPRIZEROOM_PRIZE_VENDOR_1: 'Mon1',
  GAMECORNERPRIZEROOM_PRIZE_VENDOR_2: 'Mon2',
  GAMECORNERPRIZEROOM_PRIZE_VENDOR_3: 'TMs',
};

const prizesFor = (game, menu) => {
  const dex = dexNumbers(game);

  return prizeMenu(game, menu).map(({ prize, machine, level, coins }) =>
    machine
      ? { item: `${machine} ${titleCase(prize.slice(3))}`, coins }
      : {
          pokemon: { number: dex.get(prize), name: displayName(prize) },
          level: Number(level),
          coins,
        },
  );
};

const elevatorFloors = (game, name) => {
  const lines = forGame(read(game.dir, `scripts/${name}.asm`), game.define);
  const start = lines.indexOf(`${name}Floors:`);
  const floors = [];

  for (const line of lines.slice(start + 1)) {
    const floor = line.match(/^db FLOOR_(\w+)$/)?.[1];

    if (floor) floors.push(floor);
    else if (floors.length > 0) break;
  }

  return `${farText(game, '_WhichFloorText')}\n\n${floors.join('\n')}`;
};

const elevatorPanel = (name) => (game) => elevatorFloors(game, name);

const rocketHideoutElevator = (game) =>
  [
    `Without the Lift Key:\n\n${farText(game, '_RocketHideoutElevatorAppearsToNeedKeyText')}`,
    `With the Lift Key:\n\n${elevatorFloors(game, 'RocketHideoutElevator')}`,
  ].join('\n\n');

const SIGN_TEXTS = {
  CELADONMARTELEVATOR: elevatorPanel('CeladonMartElevator'),
  SILPHCOELEVATOR_ELEVATOR: elevatorPanel('SilphCoElevator'),
  ROCKETHIDEOUTELEVATOR: rocketHideoutElevator,
  CELADONMARTROOF_VENDING_MACHINE1: vendingMachine,
  CELADONMARTROOF_VENDING_MACHINE2: vendingMachine,
  CELADONMARTROOF_VENDING_MACHINE3: vendingMachine,
  ...Object.fromEntries(
    Object.entries(PRIZE_VENDORS).map(([textId, menu]) => [
      textId,
      prizeVendor(menu),
    ]),
  ),
  ROUTE11GATE2F_LEFT_BINOCULARS: '_Route11Gate2FLeftBinocularsSnorlaxText',
  ROUTE15GATE2F_BINOCULARS: '_Route15Gate2FBinocularsText',
  ROUTE16GATE2F_LEFT_BINOCULARS: '_Route16Gate2FLeftBinocularsText',
  ROUTE16GATE2F_RIGHT_BINOCULARS: '_Route16Gate2FRightBinocularsText',
  ROUTE18GATE2F_LEFT_BINOCULARS: '_Route18Gate2FLeftBinocularsText',
  ROUTE18GATE2F_RIGHT_BINOCULARS: '_Route18Gate2FRightBinocularsText',
  COPYCATSHOUSE2F_PC: '_CopycatsHouse2FPCMySecretsText',
  WARDENSHOUSE_DISPLAY_LEFT: '_WardensHouseDisplayPhotosAndFossilsText',
  WARDENSHOUSE_DISPLAY_RIGHT: '_WardensHouseDisplayMerchandiseText',
  FUCHSIACITY_FOSSIL_SIGN: fossilSign,
};

const signText = (game, textId) =>
  typeof SIGN_TEXTS[textId] === 'function'
    ? SIGN_TEXTS[textId](game)
    : farText(game, SIGN_TEXTS[textId]);

const OPENABLE_OBJECTS = [
  [/_POKEDEX\d*$/, 'pokedex'],
  [/_TOWN_MAP$/, 'town-map'],
];

const READABLE_SPRITES = new Set(['CLIPBOARD', 'PAPER']);

const READABLE_OBJECTS = new Set([
  'MRFUJISHOUSE_POKEDEX',
  'POKEMONMANSION2F_DIARY1',
  'POKEMONMANSION2F_DIARY2',
  'POKEMONMANSION3F_DIARY',
  'POKEMONMANSIONB1F_DIARY',
]);

const opensFor = (textId) =>
  !READABLE_OBJECTS.has(textId) &&
  OPENABLE_OBJECTS.find(([pattern]) => pattern.test(textId))?.[1];

const HIDDEN_EVENT_TEXT = {
  Route15GateLeftBinoculars: '_Route15UpstairsBinocularsText',
  Mansion1Script_Switches: '_PokemonMansion1FSwitchText',
  Mansion2Script_Switches: '_PokemonMansion2FSwitchText',
  Mansion3Script_Switches: '_PokemonMansion2FSwitchText',
  Mansion4Script_Switches: '_PokemonMansion2FSwitchText',
};

const cinnabarQuiz = (game, argument) => {
  const [, answer, index] = argument.match(/\((\w+)\s*<<\s*4\)\s*\|\s*(\d+)/);
  const question = farText(game, `_CinnabarQuizQuestionsText${index}`);

  return `${question}\n\nCorrect answer: ${answer === 'FALSE' ? 'YES' : 'NO'}`;
};

const hiddenSigns = (game) => {
  const found = [];
  let map;

  for (const line of forGame(
    read(game.dir, 'data/events/hidden_events.asm'),
    game.define,
  )) {
    map = line.match(/^hidden_events_for (\w+)$/)?.[1] ?? map;

    const [, x, y, action, argument] =
      line.match(/^hidden_event\s+(\d+),\s*(\d+),\s*(\w+),\s*(.+)$/) ?? [];
    const constant = Object.keys(SIGN_MAPS).find(
      (key) => key.replaceAll('_', '') === map?.replaceAll('_', ''),
    );
    const path = SIGN_MAPS[constant];
    const text =
      action === 'PrintCinnabarQuiz'
        ? cinnabarQuiz(game, argument)
        : HIDDEN_EVENT_TEXT[action] && farText(game, HIDDEN_EVENT_TEXT[action]);

    if (!path || !text) continue;

    const floor = floorFor(constant);

    found.push({
      game: game.id,
      path,
      ...(floor && { floor }),
      x: Number(x),
      y: Number(y),
      text,
    });
  }

  return found;
};

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
      const message = SIGN_TEXTS[textId]
        ? signText(game, textId)
        : mapText(game, file, textId);

      if (!message) continue;

      signs.push({
        game: game.id,
        path,
        ...(floor && { floor }),
        x: Number(x),
        y: Number(y),
        text: message,
        ...(PRIZE_VENDORS[textId] && {
          prizes: prizesFor(game, PRIZE_VENDORS[textId]),
        }),
      });
    }

    for (const [, x, y, sprite, textId] of text.matchAll(
      /^object_event\s+(\d+),\s*(\d+),\s*SPRITE_(\w+),.*TEXT_(\w+)(?:,.*)?$/gm,
    )) {
      const opens = opensFor(textId);
      const message =
        (opens ||
          READABLE_SPRITES.has(sprite) ||
          READABLE_OBJECTS.has(textId)) &&
        mapText(game, file, textId);

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

for (const game of games) {
  signs.push(...hiddenSigns(game));
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
