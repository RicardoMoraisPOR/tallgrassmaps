import { readdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import {
  constantFromFile,
  displayName as speciesName,
  facings,
  floorFor,
  forGame,
  games,
  hasOwnMapImage,
  read,
  spritePath,
} from '../rby/disassembly.mjs';
import { farText, labelText, mapText, mapTextBlock } from '../rby/text.mjs';

const OUTPUT = new URL('../../src/data/npcs/rby.json', import.meta.url);

const NPC_MAPS = {
  PALLET_TOWN: { path: 'pallet-town' },
  OAKS_LAB: { path: 'pallet-town/oaks-lab' },
  REDS_HOUSE_1_F: { path: 'pallet-town/reds-house', floor: '1f' },
  BLUES_HOUSE: { path: 'pallet-town/blues-house' },
  ROUTE_1: { path: 'route-1' },
  VIRIDIAN_CITY: { path: 'viridian-city' },
  VIRIDIAN_POKECENTER: { path: 'viridian-city/viridian-pokemon-center' },
  VIRIDIAN_MART: { path: 'viridian-city/viridian-poke-mart' },
  VIRIDIAN_GYM: { path: 'viridian-city/viridian-gym' },
  VIRIDIAN_SCHOOL_HOUSE: { path: 'viridian-city/viridian-school-house' },
  VIRIDIAN_NICKNAME_HOUSE: { path: 'viridian-city/viridian-nickname-house' },
  ROUTE_2: { path: 'route-2' },
  ROUTE_2_GATE: { path: 'route-2/route-2-gate' },
  ROUTE_2_TRADE_HOUSE: { path: 'route-2/route-2-trade-house' },
  VIRIDIAN_FOREST_NORTH_GATE: { path: 'route-2/viridian-forest-north-gate' },
  VIRIDIAN_FOREST_SOUTH_GATE: { path: 'route-2/viridian-forest-south-gate' },
  DIGLETTS_CAVE_ROUTE_2: { path: 'route-2/digletts-cave-route-2' },
  DIGLETTS_CAVE_ROUTE_11: { path: 'route-11/digletts-cave-route-11' },
  ROUTE_11: { path: 'route-11' },
  ROUTE_11_GATE_1_F: { path: 'route-11/route-11-gate' },
  ROUTE_11_GATE_2_F: { path: 'route-11/route-11-gate' },
  ROUTE_10: { path: 'route-10' },
  ROCK_TUNNEL_POKECENTER: { path: 'route-10/rock-tunnel-pokemon-center' },
  ROCK_TUNNEL_1_F: { path: 'route-10/rock-tunnel' },
  ROCK_TUNNEL_B_1_F: { path: 'route-10/rock-tunnel' },
  POWER_PLANT: { path: 'route-10/power-plant' },
  ROUTE_12: { path: 'route-12' },
  ROUTE_12_GATE_1_F: { path: 'route-12/route-12-gate' },
  ROUTE_12_GATE_2_F: { path: 'route-12/route-12-gate' },
  ROUTE_12_SUPER_ROD_HOUSE: { path: 'route-12/route-12-super-rod-house' },
  ROUTE_13: { path: 'route-13' },
  ROUTE_14: { path: 'route-14' },
  ROUTE_15: { path: 'route-15' },
  ROUTE_15_GATE_1_F: { path: 'route-15/route-15-gate' },
  ROUTE_15_GATE_2_F: { path: 'route-15/route-15-gate' },
  ROUTE_16: { path: 'route-16' },
  ROUTE_16_GATE_1_F: { path: 'route-16/route-16-gate' },
  ROUTE_16_GATE_2_F: { path: 'route-16/route-16-gate' },
  ROUTE_16_FLY_HOUSE: { path: 'route-16/route-16-fly-house' },
  ROUTE_17: { path: 'route-17' },
  ROUTE_18: { path: 'route-18' },
  ROUTE_18_GATE_1_F: { path: 'route-18/route-18-gate' },
  ROUTE_18_GATE_2_F: { path: 'route-18/route-18-gate' },
  VIRIDIAN_FOREST: { path: 'route-2/viridian-forest' },
  PEWTER_CITY: { path: 'pewter-city' },
  PEWTER_GYM: { path: 'pewter-city/pewter-gym' },
  MUSEUM_1_F: { path: 'pewter-city/pewter-museum' },
  MUSEUM_2_F: { path: 'pewter-city/pewter-museum' },
  PEWTER_NIDORAN_HOUSE: { path: 'pewter-city/pewter-nidoran-house' },
  PEWTER_SPEECH_HOUSE: { path: 'pewter-city/pewter-speech-house' },
  PEWTER_MART: { path: 'pewter-city/pewter-poke-mart' },
  PEWTER_POKECENTER: { path: 'pewter-city/pewter-pokemon-center' },
  ROUTE_3: { path: 'route-3' },
  ROUTE_4: { path: 'route-4' },
  MT_MOON_POKECENTER: { path: 'route-4/mt-moon-pokemon-center' },
  MT_MOON_1_F: { path: 'route-4/mt-moon' },
  MT_MOON_B_1_F: { path: 'route-4/mt-moon' },
  MT_MOON_B_2_F: { path: 'route-4/mt-moon' },
  CERULEAN_CITY: { path: 'cerulean-city' },
  CERULEAN_GYM: { path: 'cerulean-city/cerulean-gym' },
  CERULEAN_TRADE_HOUSE: { path: 'cerulean-city/cerulean-trade-house' },
  CERULEAN_MELANIES_HOUSE: { path: 'cerulean-city/cerulean-trade-house' },
  BIKE_SHOP: { path: 'cerulean-city/bike-shop' },
  CERULEAN_BADGE_HOUSE: { path: 'cerulean-city/cerulean-badge-house' },
  CERULEAN_TRASHED_HOUSE: { path: 'cerulean-city/cerulean-trashed-house' },
  CERULEAN_MART: { path: 'cerulean-city/cerulean-poke-mart' },
  CERULEAN_POKECENTER: { path: 'cerulean-city/cerulean-pokemon-center' },
  LAVENDER_TOWN: { path: 'lavender-town' },
  MR_FUJIS_HOUSE: { path: 'lavender-town/mr-fujis-house' },
  LAVENDER_CUBONE_HOUSE: { path: 'lavender-town/lavender-cubone-house' },
  NAME_RATERS_HOUSE: { path: 'lavender-town/name-raters-house' },
  LAVENDER_MART: { path: 'lavender-town/lavender-poke-mart' },
  LAVENDER_POKECENTER: { path: 'lavender-town/lavender-pokemon-center' },
  POKEMON_TOWER_1_F: { path: 'lavender-town/pokemon-tower' },
  POKEMON_TOWER_2_F: { path: 'lavender-town/pokemon-tower' },
  POKEMON_TOWER_3_F: { path: 'lavender-town/pokemon-tower' },
  POKEMON_TOWER_4_F: { path: 'lavender-town/pokemon-tower' },
  POKEMON_TOWER_5_F: { path: 'lavender-town/pokemon-tower' },
  POKEMON_TOWER_6_F: { path: 'lavender-town/pokemon-tower' },
  POKEMON_TOWER_7_F: { path: 'lavender-town/pokemon-tower' },
  ROUTE_22_GATE: { path: 'route-22/route-22-gate' },
  ROUTE_23: { path: 'route-23' },
  VICTORY_ROAD_1_F: { path: 'route-23/victory-road' },
  VICTORY_ROAD_2_F: { path: 'route-23/victory-road' },
  VICTORY_ROAD_3_F: { path: 'route-23/victory-road' },
  INDIGO_PLATEAU_LOBBY: { path: 'indigo-plateau/indigo-plateau-lobby' },
  CHAMPIONS_ROOM: { path: 'indigo-plateau/pokemon-league' },
  HALL_OF_FAME: { path: 'indigo-plateau/pokemon-league' },
  ROUTE_24: { path: 'route-24' },
  ROUTE_25: { path: 'route-25' },
  BILLS_HOUSE: { path: 'route-25/bills-house' },
  ROUTE_5: { path: 'route-5' },
  ROUTE_5_GATE: { path: 'route-5/route-5-gate' },
  UNDERGROUND_PATH_ROUTE_5: { path: 'route-5/underground-path-route-5' },
  DAYCARE: { path: 'route-5/daycare' },
  UNDERGROUND_PATH_ROUTE_6: { path: 'route-6/underground-path-route-6' },
  ROUTE_6: { path: 'route-6' },
  ROUTE_6_GATE: { path: 'route-6/route-6-gate' },
  ROUTE_7: { path: 'route-7' },
  ROUTE_7_GATE: { path: 'route-7/route-7-gate' },
  UNDERGROUND_PATH_ROUTE_7: { path: 'route-7/underground-path-route-7' },
  ROUTE_8: { path: 'route-8' },
  ROUTE_8_GATE: { path: 'route-8/route-8-gate' },
  UNDERGROUND_PATH_ROUTE_8: { path: 'route-8/underground-path-route-8' },
  UNDERGROUND_PATH_WEST_EAST: { path: 'route-8/underground-path-west-east' },
  VERMILION_CITY: { path: 'vermilion-city' },
  VERMILION_GYM: { path: 'vermilion-city/vermilion-gym' },
  VERMILION_TRADE_HOUSE: { path: 'vermilion-city/vermilion-trade-house' },
  POKEMON_FAN_CLUB: { path: 'vermilion-city/pokemon-fan-club' },
  VERMILION_PIDGEY_HOUSE: { path: 'vermilion-city/vermilion-pidgey-house' },
  VERMILION_OLD_ROD_HOUSE: { path: 'vermilion-city/vermilion-old-rod-house' },
  VERMILION_MART: { path: 'vermilion-city/vermilion-poke-mart' },
  VERMILION_POKECENTER: { path: 'vermilion-city/vermilion-pokemon-center' },
  VERMILION_DOCK: { path: 'vermilion-city/ss-anne' },
  SS_ANNE_1_F: { path: 'vermilion-city/ss-anne' },
  SS_ANNE_1_F_ROOMS: { path: 'vermilion-city/ss-anne' },
  SS_ANNE_2_F: { path: 'vermilion-city/ss-anne' },
  SS_ANNE_2_F_ROOMS: { path: 'vermilion-city/ss-anne' },
  SS_ANNE_3_F: { path: 'vermilion-city/ss-anne' },
  SS_ANNE_BOW: { path: 'vermilion-city/ss-anne' },
  SS_ANNE_B_1_F: { path: 'vermilion-city/ss-anne' },
  SS_ANNE_B_1_F_ROOMS: { path: 'vermilion-city/ss-anne' },
  SS_ANNE_KITCHEN: { path: 'vermilion-city/ss-anne' },
  SS_ANNE_CAPTAINS_ROOM: { path: 'vermilion-city/ss-anne' },
  CELADON_CITY: { path: 'celadon-city' },
  CELADON_POKECENTER: { path: 'celadon-city/celadon-pokemon-center' },
  CELADON_GYM: { path: 'celadon-city/celadon-gym' },
  CELADON_DINER: { path: 'celadon-city/celadon-diner' },
  CELADON_HOTEL: { path: 'celadon-city/celadon-hotel' },
  CELADON_CHIEF_HOUSE: { path: 'celadon-city/celadon-chief-house' },
  GAME_CORNER_PRIZE_ROOM: { path: 'celadon-city/game-corner-prize-room' },
  CELADON_MART_1_F: { path: 'celadon-city/celadon-dept-store' },
  CELADON_MART_2_F: { path: 'celadon-city/celadon-dept-store' },
  CELADON_MART_3_F: { path: 'celadon-city/celadon-dept-store' },
  CELADON_MART_4_F: { path: 'celadon-city/celadon-dept-store' },
  CELADON_MART_5_F: { path: 'celadon-city/celadon-dept-store' },
  CELADON_MART_ROOF: { path: 'celadon-city/celadon-dept-store' },
  CELADON_MART_ELEVATOR: { path: 'celadon-city/celadon-dept-store' },
  CELADON_MANSION_1_F: { path: 'celadon-city/celadon-mansion' },
  CELADON_MANSION_2_F: { path: 'celadon-city/celadon-mansion' },
  CELADON_MANSION_3_F: { path: 'celadon-city/celadon-mansion' },
  CELADON_MANSION_ROOF: { path: 'celadon-city/celadon-mansion' },
  CELADON_MANSION_ROOF_HOUSE: { path: 'celadon-city/celadon-mansion' },
  GAME_CORNER: { path: 'celadon-city/rocket-game-corner' },
  ROCKET_HIDEOUT_B_1_F: { path: 'celadon-city/rocket-game-corner' },
  ROCKET_HIDEOUT_B_2_F: { path: 'celadon-city/rocket-game-corner' },
  ROCKET_HIDEOUT_B_3_F: { path: 'celadon-city/rocket-game-corner' },
  ROCKET_HIDEOUT_B_4_F: { path: 'celadon-city/rocket-game-corner' },
  ROCKET_HIDEOUT_ELEVATOR: { path: 'celadon-city/rocket-game-corner' },
  CINNABAR_ISLAND: { path: 'cinnabar-island' },
  CINNABAR_GYM: { path: 'cinnabar-island/cinnabar-gym' },
  CINNABAR_LAB: { path: 'cinnabar-island/cinnabar-lab' },
  CINNABAR_LAB_TRADE_ROOM: { path: 'cinnabar-island/cinnabar-lab' },
  CINNABAR_LAB_METRONOME_ROOM: { path: 'cinnabar-island/cinnabar-lab' },
  CINNABAR_LAB_FOSSIL_ROOM: { path: 'cinnabar-island/cinnabar-lab' },
  CINNABAR_MART: { path: 'cinnabar-island/cinnabar-poke-mart' },
  CINNABAR_POKECENTER: { path: 'cinnabar-island/cinnabar-pokemon-center' },
  POKEMON_MANSION_1_F: { path: 'cinnabar-island/pokemon-mansion' },
  POKEMON_MANSION_2_F: { path: 'cinnabar-island/pokemon-mansion' },
  POKEMON_MANSION_3_F: { path: 'cinnabar-island/pokemon-mansion' },
  POKEMON_MANSION_B_1_F: { path: 'cinnabar-island/pokemon-mansion' },
  ROUTE_19: { path: 'route-19' },
  SUMMER_BEACH_HOUSE: { path: 'route-19/summer-beach-house' },
  ROUTE_20: { path: 'route-20' },
  SEAFOAM_ISLANDS_1_F: { path: 'route-20/seafoam-islands' },
  SEAFOAM_ISLANDS_B_1_F: { path: 'route-20/seafoam-islands' },
  SEAFOAM_ISLANDS_B_2_F: { path: 'route-20/seafoam-islands' },
  SEAFOAM_ISLANDS_B_3_F: { path: 'route-20/seafoam-islands' },
  SEAFOAM_ISLANDS_B_4_F: { path: 'route-20/seafoam-islands' },
  FUCHSIA_CITY: { path: 'fuchsia-city' },
  FUCHSIA_GYM: { path: 'fuchsia-city/fuchsia-gym' },
  FUCHSIA_MART: { path: 'fuchsia-city/fuchsia-poke-mart' },
  FUCHSIA_POKECENTER: { path: 'fuchsia-city/fuchsia-pokemon-center' },
  FUCHSIA_MEETING_ROOM: { path: 'fuchsia-city/fuchsia-meeting-room' },
  FUCHSIA_GOOD_ROD_HOUSE: { path: 'fuchsia-city/fuchsia-good-rod-house' },
  FUCHSIA_BILLS_GRANDPAS_HOUSE: {
    path: 'fuchsia-city/fuchsia-bills-grandpas-house',
  },
  WARDENS_HOUSE: { path: 'fuchsia-city/wardens-house' },
  SAFARI_ZONE_GATE: { path: 'fuchsia-city/safari-zone-gate' },
  SAFARI_ZONE_CENTER: { path: 'fuchsia-city/safari-zone' },
  SAFARI_ZONE_EAST: { path: 'fuchsia-city/safari-zone' },
  SAFARI_ZONE_NORTH: { path: 'fuchsia-city/safari-zone' },
  SAFARI_ZONE_WEST: { path: 'fuchsia-city/safari-zone' },
  SAFARI_ZONE_CENTER_REST_HOUSE: { path: 'fuchsia-city/safari-zone' },
  SAFARI_ZONE_EAST_REST_HOUSE: { path: 'fuchsia-city/safari-zone' },
  SAFARI_ZONE_NORTH_REST_HOUSE: { path: 'fuchsia-city/safari-zone' },
  SAFARI_ZONE_WEST_REST_HOUSE: { path: 'fuchsia-city/safari-zone' },
  SAFARI_ZONE_SECRET_HOUSE: { path: 'fuchsia-city/safari-zone' },
  UNDERGROUND_PATH_NORTH_SOUTH: {
    path: 'route-5/underground-path-north-south',
  },
};

const OBJECT_SPRITES = new Set([
  'POKE_BALL',
  'POKEDEX',
  'CLIPBOARD',
  'PAPER',
  'OLD_AMBER',
  'SNORLAX',
  'BOULDER',
]);

const SCRIPTED_BATTLES = new Set([
  'POKEMONTOWER2F_RIVAL',
  'CHAMPIONSROOM_RIVAL',
]);

const SPRITE_DIALOG = {
  NURSE: [
    {
      trigger: 'When you talk to her',
      texts: ['_PokemonCenterWelcomeText', '_ShallWeHealYourPokemonText'],
    },
    {
      trigger: 'If you say yes, she heals your party',
      texts: [
        '_NeedYourPokemonText',
        '_PokemonFightingFitText',
        '_PokemonCenterFarewellText',
      ],
    },
    {
      trigger: 'If you say no',
      texts: ['_PokemonCenterFarewellText'],
    },
  ],
  CHANSEY: [{ texts: ['_NurseChanseyText'] }],
  CLERK: [{ texts: ['_PokemartGreetingText'] }],
  LINK_RECEPTIONIST: [
    {
      trigger: 'Without a link cable connection',
      texts: [
        '_CableClubNPCAreaReservedFor2FriendsLinkedByCableText',
        '_CableClubNPCPleaseComeAgainText',
      ],
    },
  ],
};

const SAFFRON_GATE_GUARD = {
  special: true,
  dialog: [
    {
      trigger: "Without a drink, he won't let you through",
      texts: ['_SaffronGateGuardGeeImThirstyText'],
    },
    {
      trigger: 'If you have a drink, you give him one',
      texts: [
        '_SaffronGateGuardImParchedText',
        '_SaffronGateGuardYouCanGoOnThroughText',
      ],
    },
    {
      trigger: 'After you give him a drink',
      texts: ['_SaffronGateGuardThanksForTheDrinkText'],
    },
  ],
};

const route23Guard = (badge, name) => ({
  values: { wNameBuffer: name },
  dialog: [
    {
      trigger: `If you don't have the ${badge}`,
      texts: ['_Route23YouDontHaveTheBadgeYetText'],
    },
    {
      trigger: `If you have the ${badge}`,
      texts: ['_Route23OhThatIsTheBadgeText', '_Route23GoRightAheadText'],
    },
  ],
});

const FOSSILS = [
  ['Helix Fossil', 'HELIX FOSSIL', 'OMANYTE'],
  ['Dome Fossil', 'DOME FOSSIL', 'KABUTO'],
  ['Old Amber', 'OLD AMBER', 'AERODACTYL'],
];

const COIN_CASE_FORGOTTEN = '_GameCornerOopsForgotCoinCaseText';

const gameCornerClerk = (prefix) => ({
  dialog: [
    {
      trigger: 'When you talk to him',
      texts: [`${prefix}DoYouNeedSomeGameCoinsText`],
    },
    {
      trigger: 'If you say yes, you buy 50 coins for ¥1000',
      texts: [`${prefix}ThanksHereAre50CoinsText`],
    },
    {
      trigger: 'If you say no',
      texts: [`${prefix}PleaseComePlaySometimeText`],
    },
    {
      trigger: "If you can't afford them",
      texts: [`${prefix}CantAffordTheCoinsText`],
    },
    {
      trigger: 'If your Coin Case is full',
      texts: [`${prefix}CoinCaseIsFullText`],
    },
    {
      trigger: 'Without a Coin Case',
      texts: [`${prefix}DontHaveCoinCaseText`],
    },
  ],
});

const coinGiver = (coins, ask, received, full, after) => ({
  special: true,
  dialog: [
    {
      trigger: `With a Coin Case, you get ${coins} coins`,
      texts: [ask, received],
    },
    { trigger: 'Without a Coin Case', texts: [ask, COIN_CASE_FORGOTTEN] },
    { trigger: 'If your Coin Case is full', texts: [ask, full] },
    { trigger: 'After you get the coins', texts: [after] },
  ],
});

const PIKACHU_HAPPINESS = [
  ['under 51', '_CeladonMansion1Text7'],
  ['51 to 100', '_CeladonMansion1Text8'],
  ['101 to 130', '_CeladonMansion1Text9'],
  ['131 to 160', '_CeladonMansion1Text10'],
  ['161 to 200', '_CeladonMansion1Text11'],
  ['201 or more', '_CeladonMansion1Text12'],
];

const pokedexComplete = (games, before, after) => ({
  games,
  dialog: [
    { trigger: 'Before you complete the Pokédex', texts: [before] },
    {
      trigger: 'After you complete the Pokédex (Mew not needed)',
      texts: [after],
    },
  ],
});

const DRINK_TMS = [
  ['Fresh Water', 'FreshWater', 'TM13'],
  ['Soda Pop', 'SodaPop', 'TM48'],
  ['Lemonade', 'Lemonade', 'TM49'],
];

const SCRIPTED_NPCS = {
  ROUTE5GATE_GUARD: SAFFRON_GATE_GUARD,
  ROUTE6GATE_GUARD: SAFFRON_GATE_GUARD,
  ROUTE7GATE_GUARD: SAFFRON_GATE_GUARD,
  ROUTE8GATE_GUARD: SAFFRON_GATE_GUARD,
  ROUTE23_GUARD1: route23Guard('Earth Badge', 'EARTHBADGE'),
  ROUTE23_GUARD2: route23Guard('Volcano Badge', 'VOLCANOBADGE'),
  ROUTE23_SWIMMER1: route23Guard('Marsh Badge', 'MARSHBADGE'),
  ROUTE23_SWIMMER2: route23Guard('Soul Badge', 'SOULBADGE'),
  ROUTE23_GUARD3: route23Guard('Rainbow Badge', 'RAINBOWBADGE'),
  ROUTE23_GUARD4: route23Guard('Thunder Badge', 'THUNDERBADGE'),
  ROUTE23_GUARD5: route23Guard('Cascade Badge', 'CASCADEBADGE'),
  CHAMPIONSROOM_OAK: {
    presence: 'Only appears after you beat the Champion',
    cutscene: true,
    values: { wNameBuffer: 'your POKéMON' },
    dialog: [
      {
        trigger:
          'After you beat the Champion, he takes you to the Hall of Fame',
        texts: [
          '_ChampionsRoomOakCongratulatesPlayerText',
          '_ChampionsRoomOakDisappointedWithRivalText',
          '_ChampionsRoomOakComeWithMeText',
        ],
      },
    ],
  },
  ROUTE22GATE_GUARD: {
    dialog: [
      {
        trigger: "If you don't have the Boulder Badge",
        texts: [
          '_Route22GateGuardNoBoulderbadgeText',
          '_Route22GateGuardICantLetYouPassText',
        ],
      },
      {
        trigger: 'If you have the Boulder Badge',
        texts: ['_Route22GateGuardGoRightAheadText'],
      },
    ],
  },
  PALLETTOWN_OAK: {
    presence: 'Only appears when you try to leave town without a Pokémon',
    cutscene: true,
    dialog: [
      {
        trigger: 'Appears when you try to leave town without a Pokémon',
        texts: [
          '_PalletTownOakHeyWaitDontGoOutText',
          '_PalletTownOakItsUnsafeText',
          '_PalletTownOakThatWasCloseText',
          '_PalletTownOakWhewText',
          '_PalletTownOakComeWithMe',
        ],
      },
    ],
  },
  REDSHOUSE1F_MOM: {
    dialog: [
      {
        trigger: 'Before you get your first Pokémon',
        texts: ['_RedsHouse1FMomWakeUpText'],
      },
      {
        trigger: 'After you get your first Pokémon, she heals your party',
        texts: [
          '_RedsHouse1FMomYouShouldRestText',
          '_RedsHouse1FMomLookingGreatText',
        ],
      },
    ],
  },
  BLUESHOUSE_DAISY1: {
    dialog: [
      {
        trigger: 'Before you get the Pokédex',
        texts: ['_BluesHouseDaisyRivalAtLabText'],
      },
      {
        trigger: 'After you get the Pokédex, she gives you the Town Map',
        texts: ['_BluesHouseDaisyOfferMapText'],
        gift: { name: 'Town Map', sprite: 'POKEDEX' },
      },
      {
        trigger: 'If your bag is full when she offers the Town Map',
        texts: ['_BluesHouseDaisyBagFullText'],
      },
      {
        trigger: 'After you get the Town Map',
        texts: ['_BluesHouseDaisyUseMapText'],
      },
      {
        trigger: 'Once you come back later, she gets up and walks around',
        texts: ['_BluesHouseDaisyWalkingText'],
      },
    ],
  },
  ROUTE1_YOUNGSTER1: {
    dialog: [
      {
        trigger: 'The first time you talk to him, he gives you a Potion',
        texts: ['_Route1Youngster1MartSampleText'],
        gift: { name: 'Potion' },
      },
      {
        trigger: 'If your bag is full',
        texts: ['_Route1Youngster1NoRoomText'],
      },
      {
        trigger: 'After you get the Potion',
        texts: ['_Route1Youngster1AlsoGotPokeballsText'],
      },
    ],
  },
  VIRIDIANCITY_GAMBLER1: {
    dialog: [
      {
        trigger: 'Until you have the other seven badges',
        texts: ['_ViridianCityGambler1GymAlwaysClosedText'],
      },
      {
        trigger: 'Once you have the other seven badges',
        texts: ['_ViridianCityGambler1GymLeaderReturnedText'],
      },
    ],
  },
  VIRIDIANCITY_YOUNGSTER2: {
    dialog: [
      {
        trigger: 'When you talk to him',
        texts: ['_ViridianCityYoungster2YouWantToKnowAboutText'],
      },
      {
        trigger: 'If you say yes',
        texts: ['ViridianCityYoungster2CaterpieAndWeedleDescriptionText'],
      },
      {
        trigger: 'If you say no',
        texts: ['ViridianCityYoungster2OkThenText'],
      },
    ],
  },
  VIRIDIANCITY_GIRL: {
    dialog: [
      {
        trigger: 'Before you get the Pokédex',
        texts: ['_ViridianCityGirlHasntHadHisCoffeeYetText'],
      },
      {
        trigger: 'After you get the Pokédex',
        texts: ['_ViridianCityGirlWhenIGoShopText'],
      },
    ],
  },
  VIRIDIANCITY_OLD_MAN_SLEEPY: {
    presence: 'Leaves after you get the Pokédex',
    cutscene: true,
    dialog: [
      {
        trigger: 'Blocks the road north until you get the Pokédex',
        texts: ['_ViridianCityOldManSleepyPrivatePropertyText'],
      },
    ],
  },
  VIRIDIANCITY_FISHER: {
    dialog: [
      {
        trigger: 'The first time you talk to him, he gives you TM42',
        texts: ['ViridianCityFisherYouCanHaveThisText'],
        gift: { name: 'TM42' },
      },
      {
        trigger: 'If your bag is full',
        texts: ['_ViridianCityFisherTM42NoRoomText'],
      },
      {
        trigger: 'After you get TM42',
        texts: ['_ViridianCityFisherTM42ExplanationText'],
      },
    ],
  },
  VIRIDIANCITY_OLD_MAN: {
    presence: 'Only appears after you get the Pokédex',
    dialog: [
      {
        trigger: 'After you get the Pokédex, he asks if you are in a hurry',
        texts: ['_ViridianCityOldManHadMyCoffeeNowText'],
      },
      {
        trigger: 'If you say yes',
        texts: ['_ViridianCityOldManTimeIsMoneyText'],
      },
      {
        trigger: 'If you say no, he shows you how to catch Pokémon',
        texts: [
          '_ViridianCityOldManKnowHowToCatchPokemonText',
          '_ViridianCityOldManYouNeedToWeakenTheTargetText',
        ],
      },
    ],
  },
  VIRIDIANMART_CLERK: {
    dialog: [
      {
        trigger: 'When you first walk in, he gives you Oak’s Parcel',
        texts: [
          '_ViridianMartClerkYouCameFromPalletTownText',
          '_ViridianMartClerkParcelQuestText',
        ],
        gift: { name: 'Oak’s Parcel' },
      },
      {
        trigger: 'Until you deliver the parcel',
        texts: ['_ViridianMartClerkSayHiToOakText'],
      },
      {
        trigger: 'After you deliver the parcel, he runs the shop',
        texts: ['_PokemartGreetingText'],
      },
    ],
  },
  VIRIDIANGYM_GYM_GUIDE: {
    dialog: [
      {
        trigger: 'Before you beat Giovanni',
        texts: ['_ViridianGymGuidePreBattleText'],
      },
      {
        trigger: 'After you beat Giovanni',
        texts: ['_ViridianGymGuidePostBattleText'],
      },
    ],
  },
  ROUTE2GATE_OAKS_AIDE: {
    values: {
      wOaksAideRewardItemName: 'HM05',
      hOaksAideRequirement: '10',
    },
    dialog: [
      {
        trigger: 'When you talk to him',
        texts: ['_OaksAideHiText'],
      },
      {
        trigger:
          'If you say yes with at least 10 kinds caught, he gives you HM05',
        texts: [
          '_OaksAideHereYouGoText',
          '_OaksAideGotItemText',
          '_Route2GateOaksAideFlashExplanationText',
        ],
        values: { hOaksAideNumMonsOwned: '10' },
        gift: { name: 'HM05' },
      },
      {
        trigger: 'If your bag is full',
        texts: ['_OaksAideNoRoomText'],
      },
      {
        trigger: 'If you say yes with fewer than 10 kinds caught',
        texts: ['_OaksAideUhOhText'],
        values: { hOaksAideNumMonsOwned: 'X' },
      },
      {
        trigger: 'If you say no',
        texts: ['_OaksAideComeBackText'],
      },
      {
        trigger: 'After you get HM05',
        texts: ['_Route2GateOaksAideFlashExplanationText'],
      },
    ],
  },
  ROUTE11GATE2F_OAKS_AIDE: {
    values: {
      wOaksAideRewardItemName: 'ITEMFINDER',
      hOaksAideRequirement: '30',
    },
    dialog: [
      {
        trigger: 'When you talk to him',
        texts: ['_OaksAideHiText'],
      },
      {
        trigger:
          'If you say yes with at least 30 kinds caught, he gives you the Itemfinder',
        texts: [
          '_OaksAideHereYouGoText',
          '_OaksAideGotItemText',
          '_Route11Gate2FOaksAideItemfinderDescriptionText',
        ],
        values: { hOaksAideNumMonsOwned: '30' },
        gift: { name: 'Itemfinder' },
      },
      {
        trigger: 'If your bag is full',
        texts: ['_OaksAideNoRoomText'],
      },
      {
        trigger: 'If you say yes with fewer than 30 kinds caught',
        texts: ['_OaksAideUhOhText'],
        values: { hOaksAideNumMonsOwned: 'X' },
      },
      {
        trigger: 'If you say no',
        texts: ['_OaksAideComeBackText'],
      },
      {
        trigger: 'After you get the Itemfinder',
        texts: ['_Route11Gate2FOaksAideItemfinderDescriptionText'],
      },
    ],
  },
  ROUTE16GATE1F_GUARD: {
    dialog: [
      {
        trigger: 'Without a Bicycle',
        texts: ['_Route16Gate1FGuardNoPedestriansAllowedText'],
      },
      {
        trigger: 'If you try to go through without a Bicycle, he stops you',
        texts: ['_Route16Gate1FGuardWaitUpText'],
      },
      {
        trigger: 'With a Bicycle',
        texts: ['_Route16Gate1FGuardCyclingRoadExplanationText'],
      },
    ],
  },
  ROUTE16FLYHOUSE_BRUNETTE_GIRL: {
    dialog: [
      {
        trigger: 'When you talk to her, she gives you HM02',
        texts: [
          '_Route16FlyHouseBrunetteGirlText',
          '_Route16FlyHouseBrunetteGirlReceivedHM02Text',
        ],
        gift: { name: 'HM02' },
      },
      {
        trigger: 'If your bag is full',
        texts: ['_Route16FlyHouseBrunetteGirlHM02NoRoomText'],
      },
      {
        trigger: 'After you get HM02',
        texts: ['_Route16FlyHouseBrunetteGirlHM02ExplanationText'],
      },
    ],
  },
  ROUTE18GATE1F_GUARD: {
    dialog: [
      {
        trigger: 'Without a Bicycle',
        texts: ['_Route18Gate1FGuardYouNeedABicycleText'],
      },
      {
        trigger: 'If you try to go through without a Bicycle, he stops you',
        texts: ['_Route18Gate1FGuardExcuseMeText'],
      },
      {
        trigger: 'With a Bicycle',
        texts: ['_Route18Gate1FGuardCyclingRoadUphillText'],
      },
    ],
  },
  ROUTE15GATE2F_OAKS_AIDE: {
    values: {
      wOaksAideRewardItemName: 'EXP.ALL',
      hOaksAideRequirement: '50',
    },
    dialog: [
      {
        trigger: 'When you talk to him',
        texts: ['_OaksAideHiText'],
      },
      {
        trigger:
          'If you say yes with at least 50 kinds caught, he gives you the Exp. All',
        texts: [
          '_OaksAideHereYouGoText',
          '_OaksAideGotItemText',
          '_Route15Gate2FOaksAideExpAllText',
        ],
        values: { hOaksAideNumMonsOwned: '50' },
        gift: { name: 'Exp. All' },
      },
      {
        trigger: 'If your bag is full',
        texts: ['_OaksAideNoRoomText'],
      },
      {
        trigger: 'If you say yes with fewer than 50 kinds caught',
        texts: ['_OaksAideUhOhText'],
        values: { hOaksAideNumMonsOwned: 'X' },
      },
      {
        trigger: 'If you say no',
        texts: ['_OaksAideComeBackText'],
      },
      {
        trigger: 'After you get the Exp. All',
        texts: ['_Route15Gate2FOaksAideExpAllText'],
      },
    ],
  },
  ROUTE12GATE2F_BRUNETTE_GIRL: {
    dialog: [
      {
        trigger: 'The first time you talk to her, she gives you TM39',
        texts: [
          '_Route12Gate2FBrunetteGirlYouCanHaveThisText',
          '_Route12Gate2FBrunetteGirlReceivedTM39Text',
        ],
        gift: { name: 'TM39' },
      },
      {
        trigger: 'If your bag is full',
        texts: ['_Route12Gate2FBrunetteGirlTM39NoRoomText'],
      },
      {
        trigger: 'After you get TM39',
        texts: ['_Route12Gate2FBrunetteGirlTM39ExplanationText'],
      },
    ],
  },
  ROUTE12SUPERRODHOUSE_FISHING_GURU: {
    special: true,
    values: { wStringBuffer: 'SUPER ROD' },
    dialog: [
      {
        trigger: 'When you talk to him',
        texts: ['_Route12SuperRodHouseFishingGuruDoYouLikeToFishText'],
      },
      {
        trigger: 'If you say yes, he gives you the Super Rod',
        texts: [
          '_Route12SuperRodHouseFishingGuruReceivedSuperRodText',
          '_Route12SuperRodHouseFishingGuruFishingWayOfLifeText',
        ],
        gift: { name: 'Super Rod' },
      },
      {
        trigger: 'If you say no',
        texts: ['_Route12SuperRodHouseFishingGuruThatsDisappointingText'],
      },
      {
        trigger: 'If your bag is full',
        texts: ['_Route12SuperRodHouseFishingGuruNoRoomText'],
      },
      {
        trigger: 'After you get the Super Rod',
        texts: ['_Route12SuperRodHouseFishingGuruTryFishingText'],
      },
    ],
  },
  POKEMONTOWER7F_MR_FUJI: {
    presence: 'Leaves after you beat the Team Rocket members holding him',
    cutscene: true,
    dialog: [
      {
        trigger:
          'Held by Team Rocket until you beat them, then he takes you to his house',
        texts: ['_PokemonTower7FMrFujiRescueText'],
      },
    ],
  },
  LAVENDERTOWN_LITTLE_GIRL: {
    dialog: [
      {
        trigger: 'When you talk to her',
        texts: ['_LavenderTownLittleGirlDoYouBelieveInGhostsText'],
      },
      {
        trigger: 'If you say yes',
        texts: ['_LavenderTownLittleGirlSoThereAreBelieversText'],
      },
      {
        trigger: 'If you say no',
        texts: ['_LavenderTownLittleGirlHaHaGuessNotText'],
      },
    ],
  },
  MRFUJISHOUSE_SUPER_NERD: {
    dialog: [
      {
        trigger: 'Before you rescue Mr. Fuji',
        texts: ['_MrFujisHouseSuperNerdMrFujiIsntHereText'],
      },
      {
        trigger: 'After you rescue Mr. Fuji',
        texts: ['_MrFujisHouseSuperNerdMrFujiHadBeenPrayingText'],
      },
    ],
  },
  MRFUJISHOUSE_LITTLE_GIRL: {
    dialog: [
      {
        trigger: 'Before you rescue Mr. Fuji',
        texts: ['_MrFujisHouseLittleGirlThisIsMrFujisHouseText'],
      },
      {
        trigger: 'After you rescue Mr. Fuji',
        texts: ['_MrFujisHouseLittleGirlPokemonAreNiceToHugText'],
      },
    ],
  },
  MRFUJISHOUSE_MR_FUJI: {
    presence: 'Only appears after you rescue him from Pokémon Tower',
    values: { wStringBuffer: 'POKé FLUTE' },
    dialog: [
      {
        trigger:
          'After you rescue him from Pokémon Tower, he gives you the Poké Flute',
        texts: [
          '_MrFujisHouseMrFujiIThinkThisMayHelpYourQuestText',
          '_MrFujisHouseMrFujiReceivedPokeFluteText',
          '_MrFujisHouseMrFujiPokeFluteExplanationText',
        ],
        gift: { name: 'Poké Flute' },
      },
      {
        trigger: 'If your bag is full',
        texts: ['_MrFujisHouseMrFujiPokeFluteNoRoomText'],
      },
      {
        trigger: 'After you get the Poké Flute',
        texts: ['_MrFujisHouseMrFujiHasMyFluteHelpedYouText'],
      },
    ],
  },
  LAVENDERCUBONEHOUSE_BRUNETTE_GIRL: {
    dialog: [
      {
        trigger: 'Before you rescue Mr. Fuji',
        texts: ['_LavenderCuboneHouseBrunetteGirlPoorCubonesMotherText'],
      },
      {
        trigger: 'After you rescue Mr. Fuji',
        texts: ['_LavenderCuboneHouseBrunetteGirlGhostIsGoneText'],
      },
    ],
  },
  LAVENDERMART_COOLTRAINER_M: {
    dialog: [
      {
        trigger: 'Before you rescue Mr. Fuji',
        texts: ['_LavenderMartCooltrainerMReviveText'],
      },
      {
        trigger: 'After you rescue Mr. Fuji',
        texts: ['_LavenderMartCooltrainerMNuggetText'],
      },
    ],
  },
  NAMERATERSHOUSE_NAME_RATER: {
    special: true,
    values: { wNameBuffer: 'POKéMON', wBuffer: 'POKéMON' },
    dialog: [
      {
        trigger: 'When you talk to him',
        texts: ['_NameRatersHouseNameRaterWantMeToRateText'],
      },
      {
        trigger: 'If you say yes',
        texts: ['_NameRatersHouseNameRaterWhichPokemonText'],
      },
      {
        trigger: 'If you pick a Pokémon you caught',
        texts: ['_NameRatersHouseNameRaterGiveItANiceNameText'],
      },
      {
        trigger: 'If you say yes, he renames it',
        texts: [
          '_NameRatersHouseNameRaterWhatShouldWeNameItText',
          '_NameRatersHouseNameRaterPokemonHasBeenRenamedText',
        ],
      },
      {
        trigger: 'If you pick a Pokémon you got in a trade',
        texts: ['_NameRatersHouseNameRaterATrulyImpeccableNameText'],
      },
      {
        trigger: 'If you say no',
        texts: ['_NameRatersHouseNameRaterComeAnyTimeYouLikeText'],
      },
    ],
  },
  PEWTERCITY_SUPER_NERD1: {
    special: true,
    dialog: [
      {
        trigger: 'When you talk to him',
        texts: ['_PewterCitySuperNerd1DidYouCheckOutMuseumText'],
      },
      {
        trigger: 'If you say yes',
        texts: ['_PewterCitySuperNerd1WerentThoseFossilsAmazingText'],
      },
      {
        trigger: 'If you say no, he walks you to the Museum',
        texts: [
          '_PewterCitySuperNerd1YouHaveToGoText',
          '_PewterCitySuperNerd1ItsRightHereText',
        ],
      },
    ],
  },
  PEWTERCITY_SUPER_NERD2: {
    dialog: [
      {
        trigger: 'When you talk to him',
        texts: ['_PewterCitySuperNerd2DoYouKnowWhatImDoingText'],
      },
      {
        trigger: 'If you say yes',
        texts: ['_PewterCitySuperNerd2ThatsRightText'],
      },
      {
        trigger: 'If you say no',
        texts: ['_PewterCitySuperNerd2ImSprayingRepelText'],
      },
    ],
  },
  PEWTERCITY_YOUNGSTER: {
    cutscene: true,
    dialog: [
      {
        trigger:
          'When you talk to him, or try to leave east before beating Brock, he walks you to the Gym',
        texts: [
          '_PewterCityYoungsterYoureATrainerFollowMeText',
          '_PewterCityYoungsterGoTakeOnBrockText',
        ],
      },
    ],
  },
  PEWTERGYM_GYM_GUIDE: {
    dialog: [
      {
        trigger: 'Before you beat Brock',
        texts: ['_PewterGymGuidePreAdviceText'],
      },
      {
        trigger: 'If you say yes',
        texts: ['_PewterGymGuideBeginAdviceText', '_PewterGymGuideAdviceText'],
      },
      {
        trigger: 'If you say no',
        texts: ['_PewterGymGuideFreeServiceText', '_PewterGymGuideAdviceText'],
      },
      {
        trigger: 'After you beat Brock',
        texts: ['_PewterGymGuidePostBattleText'],
      },
    ],
  },
  MUSEUM1F_SCIENTIST1: {
    dialog: [
      {
        trigger: 'When you walk up to the counter, he asks for the ¥50 fee',
        texts: ['_Museum1FScientist1WouldYouLikeToComeInText'],
      },
      {
        trigger: 'If you pay',
        texts: ['_Museum1FScientist1ThankYouText'],
      },
      {
        trigger: "If you don't have enough money",
        texts: [
          '_Museum1FScientist1DontHaveEnoughMoneyText',
          '_Museum1FScientist1ComeAgainText',
        ],
      },
      {
        trigger: 'If you say no',
        texts: ['_Museum1FScientist1ComeAgainText'],
      },
      {
        trigger: 'After you buy a ticket',
        texts: ['_Museum1FScientist1TakePlentyOfTimeText'],
      },
      {
        trigger: 'If you talk to him from the side without a ticket',
        texts: ['_Museum1FScientist1GoToOtherSideText'],
      },
      {
        trigger: 'If you talk to him from behind the counter',
        texts: ['_Museum1FScientist1DoYouKnowWhatAmberIsText'],
      },
      {
        trigger: 'If you say yes',
        texts: ['_Museum1FScientist1TheresALabSomewhereText'],
      },
      {
        trigger: 'If you say no',
        texts: ['_Museum1FScientist1AmberIsFossilizedTreeSapText'],
      },
    ],
  },
  MUSEUM1F_SCIENTIST2: {
    dialog: [
      {
        trigger: 'He gives you the Old Amber',
        texts: [
          '_Museum1FScientist2TakeThisToAPokemonLabText',
          '_Museum1FScientist2ReceivedOldAmberText',
        ],
        gift: { name: 'Old Amber', sprite: 'OLD_AMBER' },
      },
      {
        trigger: 'If your bag is full',
        texts: ['_Museum1FScientist2YouDontHaveSpaceText'],
      },
      {
        trigger: 'After you get the Old Amber',
        texts: ['_Museum1FScientist2GetTheOldAmberCheckText'],
      },
    ],
  },
  MUSEUM2F_HIKER: {
    games: ['yellow'],
    dialog: [
      {
        trigger: "When Pikachu isn't following you",
        texts: ['_Museum2FHikerText'],
      },
      {
        trigger: 'When Pikachu is following you with low friendship',
        texts: ['_Museum2FPikachuText1'],
      },
      {
        trigger: 'When Pikachu is following you with high friendship',
        texts: ['_Museum2FPikachuText2'],
      },
    ],
  },
  MTMOONPOKECENTER_MAGIKARP_SALESMAN: {
    special: true,
    dialog: [
      {
        trigger: 'He offers to sell you a Magikarp for ¥500',
        texts: ['_MtMoonPokecenterMagikarpSalesmanIGotADealText'],
        pokemon: 'MAGIKARP',
      },
      {
        trigger: 'If you say no',
        texts: ['_MtMoonPokecenterMagikarpSalesmanNoText'],
      },
      {
        trigger: "If you don't have enough money",
        texts: ['_MtMoonPokecenterMagikarpSalesmanNoMoneyText'],
      },
      {
        trigger: 'After you buy the Magikarp',
        texts: ['_MtMoonPokecenterMagikarpSalesmanNoRefundsText'],
      },
    ],
  },
  MTMOONB2F_DOME_FOSSIL: {
    item: true,
    values: { wStringBuffer: 'DOME FOSSIL' },
    dialog: [
      {
        trigger: 'After you beat the Super Nerd',
        texts: ['_MtMoonB2FDomeFossilYouWantText'],
      },
      {
        trigger:
          'If you say yes, you get the Dome Fossil and he takes the other one',
        texts: [
          '_MtMoonB2FReceivedFossilText',
          '_MtMoonB2FSuperNerdThenThisIsMineText',
        ],
        gift: { name: 'Dome Fossil', sprite: 'FOSSIL' },
      },
      {
        trigger: 'If your bag is full',
        texts: ['_MtMoonB2FYouHaveNoRoomText'],
      },
    ],
  },
  MTMOONB2F_HELIX_FOSSIL: {
    item: true,
    values: { wStringBuffer: 'HELIX FOSSIL' },
    dialog: [
      {
        trigger: 'After you beat the Super Nerd',
        texts: ['_MtMoonB2FHelixFossilYouWantText'],
      },
      {
        trigger:
          'If you say yes, you get the Helix Fossil and he takes the other one',
        texts: [
          '_MtMoonB2FReceivedFossilText',
          '_MtMoonB2FSuperNerdThenThisIsMineText',
        ],
        gift: { name: 'Helix Fossil', sprite: 'FOSSIL' },
      },
      {
        trigger: 'If your bag is full',
        texts: ['_MtMoonB2FYouHaveNoRoomText'],
      },
    ],
  },
  CERULEANCITY_GUARD2: {
    presence: 'Leaves after you beat the Team Rocket thief',
    cutscene: true,
    dialog: [
      {
        trigger: 'Guards the door until you visit Bill',
        texts: ['_CeruleanCityGuardText'],
      },
    ],
  },
  CERULEANCITY_SUPER_NERD3: {
    presence: 'Leaves after you enter the Hall of Fame',
    cutscene: true,
    dialog: [
      {
        trigger: 'Blocks Cerulean Cave until you enter the Hall of Fame',
        texts: ['_CeruleanCitySuperNerd3Text'],
      },
    ],
  },
  CERULEANCITY_COOLTRAINER_F1: {
    dialog: [
      {
        trigger: 'Sometimes (30%)',
        texts: ['_CeruleanCityCooltrainerF1SlowbroUseSonicboomText'],
      },
      {
        trigger: 'Sometimes (31%)',
        texts: ['_CeruleanCityCooltrainerF1SlowbroPunchText'],
      },
      {
        trigger: 'Usually (39%)',
        texts: ['_CeruleanCityCooltrainerF1SlowbroWithdrawText'],
      },
      {
        trigger: 'Sometimes (30%)',
        texts: ['_CeruleanCityCooltrainerF1ElectrodeUseSonicboomText'],
      },
      {
        trigger: 'Sometimes (31%)',
        texts: ['_CeruleanCityCooltrainerF1ElectrodePunchText'],
      },
      {
        trigger: 'Usually (39%)',
        texts: ['_CeruleanCityCooltrainerF1ElectrodeWithdrawText'],
      },
    ],
  },
  CERULEANCITY_SLOWBRO: {
    dialog: [
      {
        trigger: 'Sometimes (30%)',
        texts: ['_CeruleanCitySlowbroTookASnoozeText'],
      },
      {
        trigger: 'Sometimes (23%)',
        texts: ['_CeruleanCitySlowbroIsLoafingAroundText'],
      },
      {
        trigger: 'Sometimes (23%)',
        texts: ['_CeruleanCitySlowbroTurnedAwayText'],
      },
      {
        trigger: 'Sometimes (23%)',
        texts: ['_CeruleanCitySlowbroIgnoredOrdersText'],
      },
    ],
  },
  CERULEANCITY_ELECTRODE: {
    dialog: [
      {
        trigger: 'Sometimes (30%)',
        texts: ['_CeruleanCityElectrodeTookASnoozeText'],
      },
      {
        trigger: 'Sometimes (23%)',
        texts: ['_CeruleanCityElectrodeIsLoafingAroundText'],
      },
      {
        trigger: 'Sometimes (23%)',
        texts: ['_CeruleanCityElectrodeTurnedAwayText'],
      },
      {
        trigger: 'Sometimes (23%)',
        texts: ['_CeruleanCityElectrodeIgnoredOrdersText'],
      },
    ],
  },
  CERULEANGYM_GYM_GUIDE: {
    dialog: [
      {
        trigger: 'Before you beat Misty',
        texts: ['_CeruleanGymGymGuideChampInMakingText'],
      },
      {
        trigger: 'After you beat Misty',
        texts: ['_CeruleanGymGymGuideBeatMistyText'],
      },
    ],
  },
  BIKESHOP_CLERK: {
    special: true,
    dialog: [
      {
        trigger: 'Without a Bike Voucher',
        texts: ['_BikeShopClerkWelcomeText', '_BikeShopClerkDoYouLikeItText'],
      },
      {
        trigger: 'If you pick the Bicycle',
        texts: ['_BikeShopCantAffordText'],
      },
      {
        trigger: 'If you cancel',
        texts: ['_BikeShopComeAgainText'],
      },
      {
        trigger: 'With the Bike Voucher, he gives you the Bicycle',
        texts: [
          '_BikeShopClerkOhThatsAVoucherText',
          '_BikeShopExchangedVoucherText',
        ],
        gift: { name: 'Bicycle', sprite: 'RED_BIKE' },
      },
      {
        trigger: 'If your bag is full',
        texts: ['_BikeShopBagFullText'],
      },
      {
        trigger: 'After you get the Bicycle',
        texts: ['_BikeShopClerkHowDoYouLikeYourBicycleText'],
      },
    ],
  },
  BIKESHOP_YOUNGSTER: {
    dialog: [
      {
        trigger: 'Before you get the Bicycle',
        texts: ['_BikeShopYoungsterTheseBikesAreExpensiveText'],
      },
      {
        trigger: 'After you get the Bicycle',
        texts: ['_BikeShopYoungsterCoolBikeText'],
      },
    ],
  },
  CERULEANBADGEHOUSE_MIDDLE_AGED_MAN: {
    dialog: [
      {
        trigger: 'When you talk to him',
        texts: [
          '_CeruleanBadgeHouseMiddleAgedManText',
          '_CeruleanBadgeHouseMiddleAgedManWhichBadgeText',
        ],
      },
      {
        trigger: 'If you pick the Boulder Badge',
        texts: ['_CeruleanBadgeHouseBoulderBadgeText'],
      },
      {
        trigger: 'If you pick the Cascade Badge',
        texts: ['_CeruleanBadgeHouseCascadeBadgeText'],
      },
      {
        trigger: 'If you pick the Thunder Badge',
        texts: ['_CeruleanBadgeHouseThunderBadgeText'],
      },
      {
        trigger: 'If you pick the Rainbow Badge',
        texts: ['_CeruleanBadgeHouseRainbowBadgeText'],
      },
      {
        trigger: 'If you pick the Soul Badge',
        texts: ['_CeruleanBadgeHouseSoulBadgeText'],
      },
      {
        trigger: 'If you pick the Marsh Badge',
        texts: ['_CeruleanBadgeHouseMarshBadgeText'],
      },
      {
        trigger: 'If you pick the Volcano Badge',
        texts: ['_CeruleanBadgeHouseVolcanoBadgeText'],
      },
      {
        trigger: 'If you pick the Earth Badge',
        texts: ['_CeruleanBadgeHouseEarthBadgeText'],
      },
      {
        trigger: "When you're done",
        texts: ['_CeruleanBadgeHouseMiddleAgedManVisitAnyTimeText'],
      },
    ],
  },
  CERULEANTRASHEDHOUSE_FISHING_GURU: {
    dialog: [
      {
        trigger: 'Before you get TM28 back',
        texts: ['_CeruleanTrashedHouseFishingGuruTheyStoleATMText'],
      },
      {
        trigger: 'After you get TM28 back',
        texts: ['_CeruleanTrashedHouseFishingGuruWhatsLostIsLostText'],
      },
    ],
  },
  CERULEANMELANIESHOUSE_MELANIE: {
    special: true,
    dialog: [
      {
        trigger: 'When you talk to her',
        texts: ['MelanieText1'],
      },
      {
        trigger: 'If Pikachu is friendly enough, she offers you Bulbasaur',
        texts: ['MelanieText2'],
      },
      {
        trigger: 'If you say yes',
        texts: ['MelanieText3'],
        pokemon: 'BULBASAUR',
      },
      {
        trigger: 'If you say no',
        texts: ['MelanieText5'],
      },
      {
        trigger: 'After you get Bulbasaur',
        texts: ['MelanieText4'],
      },
    ],
  },
  ROUTE24_COOLTRAINER_M4: {
    special: true,
    dialog: [
      {
        trigger: 'He offers you a Charmander',
        texts: ['_Route24DamianText1'],
      },
      {
        trigger: 'If you say yes',
        texts: ['_Route24DamianText2'],
        pokemon: 'CHARMANDER',
      },
      { trigger: 'If you say no', texts: ['_Route24DamianText3'] },
      {
        trigger: 'After you get Charmander',
        texts: ['_Route24DamianText4'],
      },
    ],
  },
  BILLSHOUSE_BILL_POKEMON: {
    presence: 'Leaves after you agree to help him',
    name: 'Bill',
    dialog: [
      {
        trigger: 'When you talk to him',
        texts: ['_BillsHouseBillImNotAPokemonText'],
      },
      {
        trigger: 'If you say yes',
        texts: ['_BillsHouseBillUseSeparationSystemText'],
      },
      {
        trigger: 'If you say no',
        texts: [
          '_BillsHouseBillNoYouGottaHelpText',
          '_BillsHouseBillUseSeparationSystemText',
        ],
      },
    ],
  },
  BILLSHOUSE_BILL1: {
    presence: 'Only appears after you run the Cell Separation System',
    name: 'Bill',
    cutscene: true,
    dialog: [
      {
        trigger:
          'After you run the Cell Separation System, he gives you the S.S. Ticket',
        texts: ['_BillsHouseBillThankYouText', '_SSTicketReceivedText'],
        gift: { name: 'S.S. Ticket' },
      },
      { trigger: 'If your bag is full', texts: ['_SSTicketNoRoomText'] },
      {
        trigger: 'After you get the S.S. Ticket',
        texts: ['_BillsHouseBillWhyDontYouGoInsteadOfMeText'],
      },
      {
        trigger: 'Later, he moves to his PC',
        texts: ['_BillsHouseBillCheckOutMyRarePokemonText'],
      },
    ],
  },
  DAYCARE_GENTLEMAN: {
    special: true,
    values: {
      wNameBuffer: 'POKéMON',
      wDayCareMonName: 'POKéMON',
      wDayCareNumLevelsGrown: 'X',
      wDayCareTotalCost: 'X',
    },
    dialog: [
      {
        trigger: 'When you talk to him',
        texts: ['_DaycareGentlemanIntroText'],
      },
      {
        trigger: 'If you say yes',
        texts: ['_DaycareGentlemanWhichMonText'],
      },
      {
        trigger: 'If you leave a Pokémon with him',
        texts: [
          '_DaycareGentlemanWillLookAfterMonText',
          '_DaycareGentlemanComeSeeMeInAWhileText',
        ],
      },
      {
        trigger: 'If you say no',
        texts: ['_DaycareGentlemanComeAgainText'],
      },
      {
        trigger: 'If you only have one Pokémon',
        texts: ['_DaycareGentlemanOnlyHaveOneMonText'],
      },
      {
        trigger: 'If the Pokémon knows an HM',
        texts: ['_DaycareGentlemanCantAcceptMonWithHMText'],
      },
      {
        trigger: 'If you cancel, or decline to pay when picking it up',
        texts: [
          '_DaycareGentlemanAllRightThenText',
          '_DaycareGentlemanComeAgainText',
        ],
      },
      {
        trigger: 'When you come back, if it has grown',
        texts: [
          '_DaycareGentlemanMonHasGrownText',
          '_DaycareGentlemanOweMoneyText',
        ],
      },
      {
        trigger: "If it hasn't grown yet",
        texts: ['_DaycareGentlemanMonNeedsMoreTimeText'],
      },
      {
        trigger: 'If you pay',
        texts: [
          '_DaycareGentlemanHeresYourMonText',
          '_DaycareGentlemanGotMonBackText',
        ],
      },
      {
        trigger: "If you don't have enough money",
        texts: ['_DaycareGentlemanNotEnoughMoneyText'],
      },
      {
        trigger: 'If your party is full',
        texts: ['_DaycareGentlemanNoRoomForMonText'],
      },
    ],
  },
  VERMILIONCITY_GAMBLER1: {
    dialog: [
      {
        trigger: 'Before the S.S. Anne leaves',
        texts: ['_VermilionCityGambler1DidYouSeeText'],
      },
      {
        trigger: 'After the S.S. Anne leaves',
        texts: ['_VermilionCityGambler1SSAnneDepartedText'],
      },
    ],
  },
  VERMILIONCITY_SAILOR1: {
    special: true,
    dialog: [
      {
        trigger: 'If you talk to him from the side',
        texts: ['_VermilionCitySailor1WelcomeToSSAnneText'],
      },
      {
        trigger: 'If you walk up to the dock',
        texts: ['_VermilionCitySailor1DoYouHaveATicketText'],
      },
      {
        trigger: 'If you have the S.S. Ticket',
        texts: ['_VermilionCitySailor1FlashedTicketText'],
      },
      {
        trigger: 'Without a ticket',
        texts: ['_VermilionCitySailor1YouNeedATicketText'],
      },
      {
        trigger: 'After the S.S. Anne leaves',
        texts: ['_VermilionCitySailor1ShipSetSailText'],
      },
    ],
  },
  VERMILIONCITY_MACHOP: {
    dialog: [
      {
        trigger: 'When you talk to it',
        texts: [
          '_VermilionCityMachopText',
          '_VermilionCityMachopStompingTheLandFlatText',
        ],
      },
    ],
  },
  VERMILIONCITY_OFFICER_JENNY: {
    special: true,
    dialog: [
      {
        trigger: 'Before you have the Thunder Badge',
        texts: ['_OfficerJennyText1'],
      },
      {
        trigger: 'With the Thunder Badge, she offers you Squirtle',
        texts: ['_OfficerJennyText2'],
      },
      {
        trigger: 'If you say yes',
        texts: ['_OfficerJennyText3'],
        pokemon: 'SQUIRTLE',
      },
      {
        trigger: 'If you say no',
        texts: ['_OfficerJennyText4'],
      },
      {
        trigger: 'After you get Squirtle',
        texts: ['_OfficerJennyText5'],
      },
    ],
  },
  POKEMONFANCLUB_PIKACHU_FAN: {
    dialog: [
      {
        trigger: 'When you talk to him',
        texts: ['_PokemonFanClubPikachuFanNormalText'],
      },
      {
        trigger: 'If you talked to the Seel fan first',
        texts: ['_PokemonFanClubPikachuFanBetterText'],
      },
      {
        trigger: 'After you get the Bike Voucher and come back',
        texts: ['_PokemonFanClubPikachuFanText'],
      },
    ],
  },
  POKEMONFANCLUB_CLEFAIRY_FAN: {
    dialog: [
      {
        trigger: 'When you talk to him',
        texts: ['_PokemonFanClubClefairyFanNormalText'],
      },
      {
        trigger: 'If you talked to the Seel fan first',
        texts: ['_PokemonFanClubClefairyFanBetterText'],
      },
      {
        trigger: 'After you get the Bike Voucher and come back',
        texts: ['_PokemonFanClubClefairyFanText'],
      },
    ],
  },
  POKEMONFANCLUB_SEEL_FAN: {
    dialog: [
      {
        trigger: 'When you talk to her',
        texts: ['_PokemonFanClubSeelFanNormalText'],
      },
      {
        trigger: 'If you talked to the other fan first',
        texts: ['_PokemonFanClubSeelFanBetterText'],
      },
      {
        trigger: 'After you get the Bike Voucher and come back',
        texts: ['_PokemonFanClubSeelFanText'],
      },
    ],
  },
  POKEMONFANCLUB_CHAIRMAN: {
    special: true,
    dialog: [
      {
        trigger: 'When you talk to him',
        texts: ['_PokemonFanClubChairmanIntroText'],
      },
      {
        trigger:
          'If you say yes, he tells his story and gives you a Bike Voucher',
        texts: [
          '_PokemonFanClubChairmanStoryText',
          '_PokemonFanClubReceivedBikeVoucherText',
          '_PokemonFanClubExplainBikeVoucherText',
        ],
        gift: { name: 'Bike Voucher' },
      },
      {
        trigger: 'If you say no',
        texts: ['_PokemonFanClubNoStoryText'],
      },
      {
        trigger: 'If your bag is full',
        texts: ['_PokemonFanClubBagFullText'],
      },
      {
        trigger: 'After you get the Bike Voucher',
        texts: ['_PokemonFanClubChairFinalText'],
      },
    ],
  },
  VERMILIONOLDRODHOUSE_FISHING_GURU: {
    special: true,
    values: { wStringBuffer: 'OLD ROD' },
    dialog: [
      {
        trigger: 'When you talk to him',
        texts: ['_VermilionOldRodHouseFishingGuruDoYouLikeToFishText'],
      },
      {
        trigger: 'If you say yes, he gives you the Old Rod',
        texts: [
          '_VermilionOldRodHouseFishingGuruTakeThisText',
          '_VermilionOldRodHouseFishingGuruFishingIsAWayOfLifeText',
        ],
        gift: { name: 'Old Rod' },
      },
      {
        trigger: 'If you say no',
        texts: ['_VermilionOldRodHouseFishingGuruThatsSoDisappointingText'],
      },
      {
        trigger: 'If your bag is full',
        texts: ['_VermilionOldRodHouseFishingGuruNoRoomText'],
      },
      {
        trigger: 'After you get the Old Rod',
        texts: ['_VermilionOldRodHouseFishingGuruHowAreTheFishBitingText'],
      },
    ],
  },
  SUMMERBEACHHOUSE_SURFINDUDE: {
    name: "Surfin' Dude",
    special: true,
    dialog: [
      {
        trigger: 'Unless your Pikachu knows Surf',
        texts: ['_SummerBeachHouseSurfinDudeText4'],
      },
      {
        trigger:
          'If your Pikachu knows Surf, he invites you to the surfing minigame',
        texts: ['_SummerBeachHouseSurfinDudeText1'],
      },
      {
        trigger: 'If you say no',
        texts: ['_SummerBeachHouseSurfinDudeText2'],
      },
      {
        trigger: 'Talking to him again',
        texts: ['_SummerBeachHouseSurfinDudeText3'],
      },
    ],
  },
  SUMMERBEACHHOUSE_PIKACHU: {
    dialog: [{ texts: ['_SummerBeachHousePikachuText'] }],
  },
  CINNABARGYM_GYM_GUIDE: {
    dialog: [
      {
        trigger: 'Before you beat Blaine',
        texts: ['_CinnabarGymGymGuideChampInMakingText'],
      },
      {
        trigger: 'After you beat Blaine',
        texts: ['_CinnabarGymGymGuideBeatBlaineText'],
      },
    ],
  },
  CINNABARLABMETRONOMEROOM_SCIENTIST1: {
    dialog: [
      {
        trigger: 'When you talk to him, he gives you TM35',
        texts: [
          '_CinnabarLabMetronomeRoomScientist1Text',
          '_CinnabarLabMetronomeRoomScientist1ReceivedTM35Text',
        ],
        gift: { name: 'TM35' },
      },
      {
        trigger: 'If your bag is full',
        texts: ['_CinnabarLabMetronomeRoomScientist1TM35NoRoomText'],
      },
      {
        trigger: 'After you get TM35',
        texts: ['_CinnabarLabMetronomeRoomScientist1TM35ExplanationText'],
      },
    ],
  },
  CINNABARLABFOSSILROOM_SCIENTIST1: {
    special: true,
    dialog: [
      {
        trigger: 'When you talk to him',
        texts: ['_CinnabarLabFossilRoomScientist1Text'],
      },
      {
        trigger: 'Without a fossil',
        texts: ['_CinnabarLabFossilRoomScientist1NoFossilsText'],
      },
      ...FOSSILS.map(([name, item, species]) => ({
        trigger: `If you give him the ${name}, he revives it after you leave the lab`,
        texts: [
          '_CinnabarLabFossilRoomScientist1SeesFossilText',
          '_CinnabarLabFossilRoomScientist1TakesFossilText',
          '_CinnabarLabFossilRoomScientist1GoForAWalkText2',
          '_CinnabarLabFossilRoomScientist1FossilIsBackToLifeText',
        ],
        values: { wNameBuffer: item, wStringBuffer: species },
        pokemon: species,
      })),
      {
        trigger: 'If you say no',
        texts: ['_CinnabarLabFossilRoomScientist1ComeAgainText'],
      },
      {
        trigger: 'If you come back before leaving the lab',
        texts: ['_CinnabarLabFossilRoomScientist1GoForAWalkText'],
      },
    ],
  },
  FUCHSIACITY_VOLTORB: {
    name: 'Voltorb',
    dialog: [{ texts: ['_FuchsiaCityPokemonText'] }],
  },
  FUCHSIAGYM_GYM_GUIDE: {
    dialog: [
      {
        trigger: 'Before you beat Koga',
        texts: ['_FuchsiaGymGymGuideChampInMakingText'],
      },
      {
        trigger: 'After you beat Koga',
        texts: ['_FuchsiaGymGymGuideBeatKogaText'],
      },
    ],
  },
  FUCHSIAGOODRODHOUSE_FISHING_GURU: {
    special: true,
    values: { wStringBuffer: 'GOOD ROD' },
    dialog: [
      {
        trigger: 'When you talk to him',
        texts: ['_FuchsiaGoodRodHouseFishingGuruText'],
      },
      {
        trigger: 'If you say yes, he gives you the Good Rod',
        texts: ['_FuchsiaGoodRodHouseFishingGuruReceivedGoodRodText'],
        gift: { name: 'Good Rod' },
      },
      {
        trigger: 'If you say no',
        texts: ['_FuchsiaGoodRodHouseFishingGuruThatsSoDisappointingText'],
      },
      {
        trigger: 'If your bag is full',
        texts: ['_FuchsiaGoodRodHouseFishingGuruNoRoomText'],
      },
      {
        trigger: 'After you get the Good Rod',
        texts: ['_FuchsiaGoodRodHouseFishingGuruHowAreTheFishText'],
      },
    ],
  },
  WARDENSHOUSE_WARDEN: {
    special: true,
    dialog: [
      {
        trigger: 'Without the Gold Teeth',
        texts: ['_WardensHouseWardenGibberish1Text'],
      },
      {
        trigger: 'If you say yes',
        texts: ['_WardensHouseWardenGibberish2Text'],
      },
      {
        trigger: 'If you say no',
        texts: ['_WardensHouseWardenGibberish3Text'],
      },
      {
        trigger: 'If you have the Gold Teeth, he gives you HM04',
        texts: [
          '_WardensHouseWardenGaveTheGoldTeethText',
          '_WardensHouseWardenThanksText',
          '_WardensHouseWardenReceivedHM04Text',
        ],
        gift: { name: 'HM04' },
      },
      {
        trigger: 'If your bag is full',
        texts: ['_WardensHouseWardenHM04NoRoomText'],
      },
      {
        trigger: 'After you get HM04',
        texts: ['_WardensHouseWardenHM04ExplanationText'],
      },
    ],
  },
  SAFARIZONEGATE_SAFARI_ZONE_WORKER1: {
    special: true,
    values: { wPriceTemp: '500' },
    dialog: [
      {
        trigger: 'When you talk to him',
        texts: ['_SafariZoneGateSafariZoneWorker1Text'],
      },
      {
        trigger: 'When you walk up to the counter',
        texts: ['_SafariZoneGateSafariZoneWorker1WouldYouLikeToJoinText'],
      },
      {
        trigger: 'If you pay ¥500, you get 30 Safari Balls',
        texts: [
          '_SafariZoneGateSafariZoneWorker1ThatllBe500PleaseText',
          '_SafariZoneGateSafariZoneWorker1CallYouOnThePAText',
        ],
      },
      {
        trigger: 'If you say no',
        texts: ['_SafariZoneGateSafariZoneWorker1PleaseComeAgainText'],
      },
      {
        trigger: "If you can't pay",
        texts: ['_SafariZoneGateSafariZoneWorker1NotEnoughMoneyText'],
      },
      {
        trigger: 'If you walk back out',
        texts: ['_SafariZoneGateSafariZoneWorker1LeavingEarlyText'],
      },
      {
        trigger: 'If you say yes',
        texts: ['_SafariZoneGateSafariZoneWorker1ReturnSafariBallsText'],
      },
      {
        trigger: 'If you say no',
        texts: ['_SafariZoneGateSafariZoneWorker1GoodLuckText'],
      },
      {
        trigger: 'When the game is over',
        texts: ['_SafariZoneGateSafariZoneWorker1GoodHaulComeAgainText'],
      },
    ],
  },
  SAFARIZONEGATE_SAFARI_ZONE_WORKER2: {
    dialog: [
      {
        trigger: 'When you talk to him',
        texts: ['_SafariZoneGateSafariZoneWorker2FirstTimeHereText'],
      },
      {
        trigger: 'If you say yes',
        texts: ['_SafariZoneGateSafariZoneWorker2SafariZoneExplanationText'],
      },
      {
        trigger: 'If you say no',
        texts: ['_SafariZoneGateSafariZoneWorker2YoureARegularHereText'],
      },
    ],
  },
  SAFARIZONESECRETHOUSE_FISHING_GURU: {
    dialog: [
      {
        trigger: 'When you talk to him, he gives you HM03',
        texts: [
          '_SafariZoneSecretHouseFishingGuruYouHaveWonText',
          '_SafariZoneSecretHouseFishingGuruReceivedHM03Text',
        ],
        gift: { name: 'HM03' },
      },
      {
        trigger: 'If your bag is full',
        texts: ['_SafariZoneSecretHouseFishingGuruHM03NoRoomText'],
      },
      {
        trigger: 'After you get HM03',
        texts: ['_SafariZoneSecretHouseFishingGuruHM03ExplanationText'],
      },
    ],
  },
  CELADONCITY_GRAMPS3: {
    dialog: [
      {
        trigger: 'When you talk to him, he gives you TM41',
        texts: [
          '_CeladonCityGramps3Text',
          '_CeladonCityGramps3ReceivedTM41Text',
        ],
        gift: { name: 'TM41' },
      },
      {
        trigger: 'If your bag is full',
        texts: ['_CeladonCityGramps3TM41NoRoomText'],
      },
      {
        trigger: 'After you get TM41',
        texts: ['_CeladonCityGramps3TM41ExplanationText'],
      },
    ],
  },
  CELADONDINER_GYM_GUIDE: {
    dialog: [
      {
        trigger: 'When you talk to him, he gives you the Coin Case',
        texts: [
          '_CeladonDinerGymGuideImFlatOutBustedText',
          '_CeladonDinerGymGuideReceivedCoinCaseText',
        ],
        gift: { name: 'Coin Case' },
      },
      {
        trigger: 'If your bag is full',
        texts: ['_CeladonDinerGymGuideCoinCaseNoRoomText'],
      },
      {
        trigger: 'After you get the Coin Case',
        texts: ['_CeladonDinerGymGuideWinItBackText'],
      },
    ],
  },
  CELADONMART3F_CLERK: {
    dialog: [
      {
        trigger: 'When you talk to him, he gives you TM18',
        texts: [
          '_CeladonMart3FClerkTM18PreReceiveText',
          '_CeladonMart3FClerkReceivedTM18Text',
        ],
        gift: { name: 'TM18' },
      },
      {
        trigger: 'If your bag is full',
        texts: ['_CeladonMart3FClerkTM18NoRoomText'],
      },
      {
        trigger: 'After you get TM18',
        texts: ['_CeladonMart3FClerkTM18ExplanationText'],
      },
    ],
  },
  CELADONMARTROOF_LITTLE_GIRL: {
    special: true,
    dialog: [
      {
        trigger: 'Without a drink',
        texts: ['_CeladonMartRoofLittleGirlImThirstyText'],
      },
      {
        trigger: 'With a drink',
        texts: [
          '_CeladonMartRoofLittleGirlGiveHerADrinkText',
          '_CeladonMartRoofLittleGirlGiveHerWhichDrinkText',
        ],
      },
      ...DRINK_TMS.map(([drink, label, tm]) => ({
        trigger: `If you give her ${drink}, she gives you ${tm}`,
        texts: [
          `_CeladonMartRoofLittleGirlYay${label}Text`,
          `_CeladonMartRoofLittleGirlReceived${tm}Text`,
          `_CeladonMartRoofLittleGirl${tm}ExplanationText`,
        ],
        values: { wStringBuffer: tm },
        gift: { name: tm },
      })),
      {
        trigger: 'If your bag is full',
        texts: ['_CeladonMartRoofLittleGirlNoRoomText'],
      },
      {
        trigger: "If you already got that drink's TM",
        texts: ['_CeladonMartRoofLittleGirlImNotThirstyText'],
      },
    ],
  },
  CELADONMANSION1F_GRANNY: {
    games: ['yellow'],
    dialog: [
      { trigger: 'When you talk to her', texts: ['_CeladonMansion1Text2'] },
      ...PIKACHU_HAPPINESS.map(([happiness, text]) => ({
        trigger: `If Pikachu is with you and its happiness is ${happiness}`,
        texts: ['_CeladonMansion1Text6', text],
      })),
    ],
  },
  CELADONMANSION3F_GAME_DESIGNER: pokedexComplete(
    undefined,
    '_CeladonMansion3FGameDesignerText',
    '_CeladonMansion3FGameDesignerCompletedDexText',
  ),
  CELADONMANSION3F_PROGRAMMER: pokedexComplete(
    ['yellow'],
    '_CeladonMansion3FProgrammerText',
    '_CeladonMansion3FProgrammerText2',
  ),
  CELADONMANSION3F_WRITER: pokedexComplete(
    ['yellow'],
    '_CeladonMansion3FWriterText',
    '_CeladonMansion3FWriterText2',
  ),
  CELADONMANSION3F_GRAPHIC_ARTIST: {
    games: ['yellow'],
    dialog: [
      {
        trigger: 'Before you complete the Pokédex',
        texts: ['_CeladonMansion3FGraphicArtistText'],
      },
      {
        trigger: 'After you complete the Pokédex (Mew not needed)',
        texts: ['_CeladonMansion3FGraphicArtistText2'],
      },
      {
        trigger: 'If you say yes, he prints your diploma',
        texts: ['_CeladonMansion3FGraphicArtistText4'],
      },
      {
        trigger: 'If you cancel the printing',
        texts: ['_CeladonMansion3FGraphicArtistText5'],
      },
      {
        trigger: 'If you say no',
        texts: ['_CeladonMansion3FGraphicArtistText3'],
      },
    ],
  },
  GAMECORNER_CLERK1: gameCornerClerk('_GameCornerClerk1'),
  GAMECORNER_CLERK: gameCornerClerk('_GameCornerClerk'),
  GAMECORNER_FISHING_GURU: coinGiver(
    10,
    '_GameCornerFishingGuruWantToPlayText',
    '_GameCornerFishingGuruReceived10CoinsText',
    '_GameCornerFishingGuruDontNeedMyCoinsText',
    '_GameCornerFishingGuruWinsComeAndGoText',
  ),
  GAMECORNER_FISHING_GURU1: coinGiver(
    10,
    '_GameCornerFishingGuru1WantToPlayText',
    '_GameCornerFishingGuru1Received10CoinsText',
    '_GameCornerFishingGuru1DontNeedMyCoinsText',
    '_GameCornerFishingGuru1WinsComeAndGoText',
  ),
  GAMECORNER_CLERK2: coinGiver(
    20,
    '_GameCornerClerk2WantSomeCoinsText',
    '_GameCornerClerk2Received20CoinsText',
    '_GameCornerClerk2YouHaveLotsOfCoinsText',
    '_GameCornerClerk2INeedMoreCoinsText',
  ),
  GAMECORNER_MIDDLE_AGED_MAN2: coinGiver(
    20,
    '_GameCornerMiddleAgedMan2WantSomeCoinsText',
    '_GameCornerMiddleAgedMan2Received20CoinsText',
    '_GameCornerMiddleAgedMan2YouHaveLotsOfCoinsText',
    '_GameCornerMiddleAgedMan2INeedMoreCoinsText',
  ),
  GAMECORNER_GENTLEMAN: coinGiver(
    20,
    '_GameCornerGentlemanThrowingMeOffText',
    '_GameCornerGentlemanReceived20CoinsText',
    '_GameCornerGentlemanYouGotYourOwnCoinsText',
    '_GameCornerGentlemanCloselyWatchTheReelsText',
  ),
  GAMECORNER_FISHING_GURU2: coinGiver(
    20,
    '_GameCornerFishingGuru2ThrowingMeOffText',
    '_GameCornerFishingGuru2Received20CoinsText',
    '_GameCornerFishingGuru2YouGotYourOwnCoinsText',
    '_GameCornerFishingGuru2CloselyWatchTheReelsText',
  ),
  GAMECORNER_GYM_GUIDE: {
    dialog: [
      {
        trigger: 'Before you beat Erika',
        texts: ['_GameCornerGymGuideChampInMakingText'],
      },
      {
        trigger: 'After you beat Erika',
        texts: ['_GameCornerGymGuideTheyOfferRarePokemonText'],
      },
    ],
  },
  VERMILIONGYM_GYM_GUIDE: {
    dialog: [
      {
        trigger: 'Before you beat Lt. Surge',
        texts: ['_VermilionGymGymGuideChampInMakingText'],
      },
      {
        trigger: 'After you beat Lt. Surge',
        texts: ['_VermilionGymGymGuideBeatLTSurgeText'],
      },
    ],
  },
  SSANNEKITCHEN_COOK7: {
    name: 'Chef',
    dialog: [
      {
        trigger: 'Usually (50%)',
        texts: [
          '_SSAnneKitchenCook7MainCourseIsText',
          'SSAnneKitchenCook7SalmonDuSaladText',
        ],
      },
      {
        trigger: 'Sometimes (25%)',
        texts: [
          '_SSAnneKitchenCook7MainCourseIsText',
          'SSAnneKitchenCook7EelsAuBarbecueText',
        ],
      },
      {
        trigger: 'Sometimes (25%)',
        texts: [
          '_SSAnneKitchenCook7MainCourseIsText',
          'SSAnneKitchenCook7PrimeBeefSteakText',
        ],
      },
    ],
  },
  SSANNECAPTAINSROOM_CAPTAIN: {
    special: true,
    dialog: [
      {
        trigger: 'You rub his back, and he gives you HM01',
        texts: [
          '_SSAnneCaptainsRoomRubCaptainsBackText',
          '_SSAnneCaptainsRoomCaptainIFeelMuchBetterText',
          '_SSAnneCaptainsRoomCaptainReceivedHM01Text',
        ],
        gift: { name: 'HM01' },
      },
      {
        trigger: 'If your bag is full',
        texts: ['_SSAnneCaptainsRoomCaptainHM01NoRoomText'],
      },
      {
        trigger: 'After you get HM01',
        texts: ['_SSAnneCaptainsRoomCaptainNotSickAnymoreText'],
      },
    ],
  },
  OAKSLAB_OAK1: {
    presence: 'Only appears after he brings you into the lab',
    dialog: [
      {
        trigger: 'When you follow him into the lab',
        texts: [
          '_OaksLabRivalFedUpWithWaitingText',
          '_OaksLabOakChooseMonText',
          '_OaksLabRivalWhatAboutMeText',
          '_OaksLabOakBePatientText',
        ],
      },
      {
        trigger: 'If you try to leave without a Pokémon',
        texts: ['_OaksLabOakDontGoAwayYetText'],
      },
      {
        trigger: 'Before you get your first Pokémon',
        texts: [
          '_OaksLabOak1WhichPokemonDoYouWantText',
          '_OaksLabOak1GoAheadItsYours',
        ],
      },
      {
        trigger: 'After you get your first Pokémon',
        texts: ['_OaksLabOak1YourPokemonCanFightText'],
      },
      {
        trigger: 'After your first battle',
        texts: [
          '_OaksLabOak1RaiseYourYoungPokemonText',
          '_OaksLabOak1YouShouldTalkToIt',
        ],
      },
      {
        trigger: "When you bring Oak's Parcel from the Viridian City Poké Mart",
        texts: [
          '_OaksLabOak1DeliverParcelText',
          '_OaksLabOak1ParcelThanksText',
        ],
      },
      {
        trigger: 'Right after you deliver the parcel',
        texts: [
          '_OaksLabRivalGrampsText',
          '_OaksLabRivalWhatDidYouCallMeForText',
          '_OaksLabRivalMyPokemonHasGrownStrongerText',
          '_OaksLabOakIHaveARequestText',
          '_OaksLabOakMyInventionPokedexText',
          '_OaksLabOakGotPokedexText',
          '_OaksLabOakThatWasMyDreamText',
          '_OaksLabRivalLeaveItAllToMeText',
        ],
        gift: { name: 'Pokédex', sprite: 'POKEDEX' },
      },
      {
        trigger: 'After you get the Pokédex',
        texts: ['_OaksLabOak1PokemonAroundTheWorldText'],
      },
      {
        trigger:
          'After you beat your rival on Route 22, if you have no Poké Balls',
        texts: [
          '_OaksLabOak1ReceivedPokeballsText',
          '_OaksLabGivePokeballsExplanationText',
        ],
        gift: { name: 'Poké Ball', count: 5 },
      },
      {
        trigger: 'Once you have Poké Balls',
        texts: ['_OaksLabOak1ComeSeeMeSometimesText'],
      },
      {
        trigger: 'Once you own at least two Pokémon, he rates your Pokédex',
        texts: ['_OaksLabOak1HowIsYourPokedexComingText'],
      },
    ],
  },
};

const TRADE_DIALOGSETS = { CASUAL: 1, EVOLUTION: 2, HAPPY: 3 };

const monNames = (game) => {
  const names = [
    ...read(game.dir, 'data/pokemon/names.asm').matchAll(/dname "(.+)"/g),
  ].map(([, name]) => name);

  return new Map(
    [
      ...read(game.dir, 'constants/pokemon_constants.asm').matchAll(
        /^\s*const (\w+)\s*; \$(\w+)/gm,
      ),
    ].map(([, constant, id]) => [constant, names[parseInt(id, 16) - 1]]),
  );
};

const dexNumbers = (game) =>
  new Map(
    [
      ...read(game.dir, 'constants/pokedex_constants.asm').matchAll(
        /const DEX_(\w+)\s*; (\d+)/g,
      ),
    ].map(([, constant, number]) => [constant, Number(number)]),
  );

const npcTrade = (game, file, textId) => {
  const block = mapTextBlock(game, file, textId)?.block ?? [];
  const trades = [
    ...read(game.dir, 'data/events/trades.asm').matchAll(
      /npctrade (\w+),\s*(\w+),\s*TRADE_DIALOGSET_(\w+),\s*"(\w+)"/g,
    ),
  ];
  const whichTrade = block.indexOf('ld [wWhichTrade], a');
  const nickname =
    block[whichTrade - 1] === 'xor a'
      ? trades[0]?.[4]
      : block
          .map((line) => line.match(/^ld a, TRADE_FOR_(\w+)$/)?.[1])
          .find(Boolean);

  if (whichTrade < 0 || !nickname) return undefined;

  const [, give, receive, dialogSet] =
    trades.find(([, , , , name]) => name === nickname) ?? [];

  if (!give) return undefined;

  const set = TRADE_DIALOGSETS[dialogSet];
  const names = monNames(game);
  const values = {
    wInGameTradeGiveMonName: names.get(give),
    wInGameTradeReceiveMonName: names.get(receive),
  };
  const nicknameName = nickname.charAt(0) + nickname.slice(1).toLowerCase();
  const dex = dexNumbers(game);
  const trade = {
    give: { number: dex.get(give), name: speciesName(give) },
    receive: { number: dex.get(receive), name: speciesName(receive) },
  };

  return [
    {
      trigger: `Offers ${speciesName(receive)} for your ${speciesName(give)}`,
      texts: [`_WannaTrade${set}Text`],
      trade,
    },
    { trigger: 'If you say no', texts: [`_NoTrade${set}Text`] },
    {
      trigger: `If you offer a Pokémon other than ${speciesName(give)}`,
      texts: [`_WrongMon${set}Text`],
    },
    {
      trigger: `After the trade, you get ${speciesName(receive)} nicknamed ${nicknameName}`,
      texts: [`_Thanks${set}Text`],
    },
    {
      trigger: 'Talking again after the trade',
      texts: [`_AfterTrade${set}Text`],
    },
  ].flatMap(({ trigger, texts, trade }) => {
    const text = texts
      .map((label) => farText(game, label, values))
      .filter(Boolean)
      .join('\n\n');

    return text ? [{ text, trigger, ...(trade && { trade }) }] : [];
  });
};

const giftFor = (game, { sprite = 'POKE_BALL', ...gift }) => ({
  ...gift,
  sprite: spritePath(game, sprite),
});

const scriptedDialog = (game, dialog, values = {}) =>
  dialog.flatMap(({ trigger, texts, gift, pokemon, values: own }) => {
    const text = texts
      .map((label) => farText(game, label, { ...values, ...own }))
      .filter(Boolean)
      .join('\n\n');

    return text
      ? [
          {
            text,
            trigger,
            ...(gift && { gift: giftFor(game, gift) }),
            ...(pokemon && {
              pokemon: {
                number: dexNumbers(game).get(pokemon),
                name: speciesName(pokemon),
              },
            }),
          },
        ]
      : [];
  });

const spriteNames = { OFFICER_JENNY: 'Officer Jenny' };

const specialNames = {
  OAK: 'Prof. Oak',
  DAISY_SITTING: 'Daisy',
  GAMBLER: 'Old Man',
  COOLTRAINER_M: 'Cooltrainer',
  COOLTRAINER_F: 'Cooltrainer',
  OLD_MAN_SLEEPY: 'Old Man',
  OAKS_AIDE: "Oak's Aide",
  MR_FUJI: 'Mr. Fuji',
};

const titleCase = (constant) =>
  constant
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');

const displayName = (textId) => {
  const constant = textId.replace(/^[A-Z0-9]+_/, '').replace(/\d+$/, '');

  return specialNames[constant] ?? titleCase(constant);
};

const hiddenObjects = (game) =>
  new Set(
    [
      ...read(game.dir, 'data/maps/toggleable_objects.asm').matchAll(
        /toggle_object_state\s+(\w+),\s*OFF/g,
      ),
    ].map(([, name]) => name),
  );

const npcs = [];

for (const game of games) {
  const hidden = hiddenObjects(game);

  for (const fileName of readdirSync(join(game.dir, 'data/maps/objects'))) {
    const file = basename(fileName, '.asm');
    const map = constantFromFile(file);

    if (!NPC_MAPS[map]) continue;

    const { path, floor = floorFor(map) } = NPC_MAPS[map];

    if (!hasOwnMapImage(game.dir, map, path, floor, true)) continue;

    const text = forGame(
      read(game.dir, `data/maps/objects/${fileName}`),
      game.define,
    ).join('\n');
    const toggles = [...text.matchAll(/const_export\s+(\w+)/g)].map(
      ([, name]) => name,
    );
    const objects = [...text.matchAll(/^object_event\s+(.+)$/gm)].map(
      ([, args]) => args,
    );

    objects.forEach((args, index) => {
      const npc = args.match(
        /^(\d+),\s*(\d+),\s*SPRITE_(\w+),\s*\w+,\s*(\w+),\s*TEXT_(\w+)(?:,\s*(?!OPP_)\w+)?$/,
      );

      if (!npc) return;

      const [, x, y, sprite, direction, textId] = npc;
      const entry = SCRIPTED_NPCS[toggles[index]];
      const scripted =
        entry && (!entry.games || entry.games.includes(game.id))
          ? entry
          : undefined;

      if (OBJECT_SPRITES.has(sprite) && !scripted) return;
      if (SCRIPTED_BATTLES.has(toggles[index])) return;
      if (hidden.has(toggles[index]) && !scripted) return;

      const trade = !scripted && npcTrade(game, file, textId);
      const text = !scripted && !trade && mapText(game, file, textId);
      const shared = SPRITE_DIALOG[sprite];
      const dialog = scripted
        ? scriptedDialog(game, scripted.dialog, scripted.values)
        : trade
          ? trade
          : text
            ? [{ text }]
            : shared
              ? scriptedDialog(game, shared)
              : [];

      npcs.push({
        game: game.id,
        path,
        ...(floor && { floor }),
        x: Number(x),
        y: Number(y),
        name: scripted?.name ?? spriteNames[sprite] ?? displayName(textId),
        sprite: spritePath(game, sprite),
        facing: facings[direction] ?? 'down',
        dialog,
        ...(scripted?.cutscene && { cutscene: true }),
        ...(scripted?.presence && { presence: scripted.presence }),
        ...(scripted?.item && { item: true }),
        ...((trade ||
          scripted?.special ||
          scripted?.cutscene ||
          dialog.some(({ gift }) => gift)) && { special: true }),
      });
    });
  }
}

const benchGuys = (game) => {
  const texts = new Map(
    [
      ...read(game.dir, 'data/events/bench_guys.asm').matchAll(
        /bench_guy_text\s+(\w+),\s*\w+,\s*(\w+)/g,
      ),
    ].map(([, map, label]) => [map, label]),
  );
  const events = forGame(
    read(game.dir, 'data/events/hidden_events.asm'),
    game.define,
  );
  const guys = [];
  let map;

  for (const line of events) {
    map = line.match(/^hidden_events_for (\w+)$/)?.[1] ?? map;

    const [, x, y] =
      line.match(/^hidden_event\s+(\d+),\s*(\d+),\s*PrintBenchGuyText/) ?? [];

    if (x !== undefined && texts.has(map)) guys.push({ map, x, y });
  }

  return guys.flatMap(({ map, x, y }) => {
    const place = NPC_MAPS[map];
    const text = labelText(
      game,
      'engine/events/hidden_events/bench_guys.asm',
      texts.get(map),
    );

    if (!place || !text) return [];

    const floor = place.floor ?? floorFor(map);

    return [
      {
        game: game.id,
        path: place.path,
        ...(floor && { floor }),
        x: Number(x),
        y: Number(y),
        name: 'Bench Guy',
        sprite: 'bench_guy',
        facing: 'down',
        spriteOffset: [6, 0],
        dialog: [{ text }],
      },
    ];
  });
};

for (const game of games) npcs.push(...benchGuys(game));

const merged = new Map();

for (const { game, ...npc } of npcs) {
  const key = JSON.stringify(npc);
  const current = merged.get(key) ?? { ...npc, games: [] };

  current.games.push(game);
  merged.set(key, current);
}

const output = [...merged.values()];

writeFileSync(OUTPUT, `${JSON.stringify(output, null, 2)}\n`);

console.log(`Wrote ${output.length} NPCs to ${OUTPUT.pathname}`);
