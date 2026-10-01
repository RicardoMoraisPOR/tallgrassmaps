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
};

const OBJECT_SPRITES = new Set([
  'POKE_BALL',
  'POKEDEX',
  'CLIPBOARD',
  'PAPER',
  'OLD_AMBER',
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
  const nickname = mapTextBlock(game, file, textId)
    ?.block.map((line) => line.match(/^ld a, TRADE_FOR_(\w+)$/)?.[1])
    .find(Boolean);

  if (!nickname) return undefined;

  const [, give, receive, dialogSet] =
    [
      ...read(game.dir, 'data/events/trades.asm').matchAll(
        /npctrade (\w+),\s*(\w+),\s*TRADE_DIALOGSET_(\w+),\s*"(\w+)"/g,
      ),
    ].find(([, , , , name]) => name === nickname) ?? [];

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

const specialNames = {
  OAK: 'Prof. Oak',
  DAISY_SITTING: 'Daisy',
  GAMBLER: 'Old Man',
  COOLTRAINER_M: 'Cooltrainer',
  COOLTRAINER_F: 'Cooltrainer',
  OLD_MAN_SLEEPY: 'Old Man',
  OAKS_AIDE: "Oak's Aide",
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

      if (OBJECT_SPRITES.has(sprite)) return;
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
        name: displayName(textId),
        sprite: spritePath(game, sprite),
        facing: facings[direction] ?? 'down',
        dialog,
        ...(scripted?.cutscene && { cutscene: true }),
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
