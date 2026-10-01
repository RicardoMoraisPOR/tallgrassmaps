import { readdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import {
  constantFromFile,
  facings,
  floorFor,
  forGame,
  games,
  hasOwnMapImage,
  read,
  spritePath,
} from '../rby/disassembly.mjs';
import { farText, labelText, mapText } from '../rby/text.mjs';

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
};

const OBJECT_SPRITES = new Set(['POKE_BALL', 'POKEDEX', 'CLIPBOARD', 'PAPER']);

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

const SCRIPTED_NPCS = {
  PALLETTOWN_OAK: {
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
  OAKSLAB_OAK1: {
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

const giftFor = (game, { sprite = 'POKE_BALL', ...gift }) => ({
  ...gift,
  sprite: spritePath(game, sprite),
});

const scriptedDialog = (game, dialog) =>
  dialog.flatMap(({ trigger, texts, gift }) => {
    const text = texts
      .map((label) => farText(game, label))
      .filter(Boolean)
      .join('\n\n');

    return text
      ? [{ text, trigger, ...(gift && { gift: giftFor(game, gift) }) }]
      : [];
  });

const specialNames = {
  OAK: 'Prof. Oak',
  DAISY_SITTING: 'Daisy',
  GAMBLER: 'Old Man',
  COOLTRAINER_M: 'Cooltrainer',
  COOLTRAINER_F: 'Cooltrainer',
  OLD_MAN_SLEEPY: 'Old Man',
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
      const scripted = SCRIPTED_NPCS[toggles[index]];

      if (OBJECT_SPRITES.has(sprite)) return;
      if (hidden.has(toggles[index]) && !scripted) return;

      const text = !scripted && mapText(game, file, textId);
      const shared = SPRITE_DIALOG[sprite];
      const dialog = scripted
        ? scriptedDialog(game, scripted.dialog)
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
        name: displayName(textId),
        sprite: spritePath(game, sprite),
        facing: facings[direction] ?? 'down',
        dialog,
        ...(scripted?.cutscene && { cutscene: true }),
        ...((scripted?.special ||
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

    return [
      {
        game: game.id,
        path: place.path,
        ...(place.floor && { floor: place.floor }),
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
