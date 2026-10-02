import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import {
  constantFromFile,
  facings,
  floorFor,
  forGame,
  games,
  hasOwnMapImage,
  locationFor,
  pokeredDir,
  read,
  spritePath,
} from '../rby/disassembly.mjs';
import { farText, trainerTexts } from '../rby/text.mjs';
import { trainerMoves } from './rby-moves.mjs';

const OUTPUT = new URL('../../src/data/trainers/rby.json', import.meta.url);

const dexNumbers = new Map(
  [
    ...read(pokeredDir, 'constants/pokedex_constants.asm').matchAll(
      /const DEX_(\w+)\s*; (\d+)/g,
    ),
  ].map(([, constant, number]) => [constant, Number(number)]),
);

const specialTrainerNames = {
  RIVAL1: 'Rival',
  RIVAL2: 'Rival',
  RIVAL3: 'Rival',
  POKEMANIAC: 'PokéManiac',
};

const trainerName = (constant, raw) =>
  specialTrainerNames[constant] ??
  raw
    .toLowerCase()
    .replace(/\.(?=\S)/g, '. ')
    .replace(/[♂♀]/, ' $&')
    .replace(
      /(^|\s)(\p{L})/gu,
      (_, space, letter) => space + letter.toUpperCase(),
    );

const specialAreaNames = {
  LoreleisRoom: "Lorelei's Room",
  BrunosRoom: "Bruno's Room",
  AgathasRoom: "Agatha's Room",
  LancesRoom: "Lance's Room",
  ChampionsRoom: "Champion's Room",
};

const areaFor = (file, path) => {
  if (specialAreaNames[file]) return specialAreaNames[file];

  const words = file.match(/B?\d+F|\d+|[A-Z]+(?=[A-Z][a-z]|\d|$)|[A-Z][a-z]*/g);
  const place = path.split('/').at(-1).split('-');
  const slug = words.map((word) => word.toLowerCase());

  if (slug.join('-') === path) return undefined;

  const own = place.every((part, index) => slug[index] === part);
  const area = (own ? words.slice(place.length) : words)
    .join(' ')
    .replace('Pokemon', 'Pokémon');

  return area || undefined;
};

const starterChoice = {
  prompt: 'Your starter',
  label: 'If you chose',
  species: ['CHARMANDER', 'SQUIRTLE', 'BULBASAUR'],
};

const rivalChoices = {
  red: starterChoice,
  blue: starterChoice,
  yellow: {
    prompt: 'If Eevee becomes',
    label: 'If Eevee becomes',
    species: ['JOLTEON', 'FLAREON', 'VAPOREON'],
  },
};

const speciesName = (species) =>
  species.charAt(0) + species.slice(1).toLowerCase();

const rivalTeamSignature = {
  red: [
    ['SQUIRTLE', 'WARTORTLE', 'BLASTOISE'],
    ['BULBASAUR', 'IVYSAUR', 'VENUSAUR'],
    ['CHARMANDER', 'CHARMELEON', 'CHARIZARD'],
  ],
  yellow: [
    ['EEVEE', 'JOLTEON'],
    ['EEVEE', 'FLAREON'],
    ['EEVEE', 'VAPOREON'],
  ],
};

rivalTeamSignature.blue = rivalTeamSignature.red;

const rb = (teams) => ({ red: teams, blue: teams });

const TRAINER_DIALOG_MAPS = new Set([
  'ViridianGym',
  'ViridianForest',
  'PewterGym',
  'Route3',
  'Route4',
  'MtMoon1F',
  'MtMoonB2F',
  'CeruleanCity',
  'CeruleanGym',
  'Route24',
  'Route25',
  'VictoryRoad1F',
  'VictoryRoad2F',
  'VictoryRoad3F',
  'Route6',
  'Route8',
  'Route9',
  'Route10',
  'RockTunnel1F',
  'RockTunnelB1F',
  'Route11',
  'Route12',
  'PokemonTower3F',
  'PokemonTower4F',
  'PokemonTower5F',
  'PokemonTower6F',
  'PokemonTower7F',
  'VermilionGym',
  'SSAnne1FRooms',
  'SSAnne2FRooms',
  'SSAnneB1FRooms',
  'SSAnneBow',
  'SSAnne2F',
]);

const CUTSCENE_OBJECTS = new Set([
  'POKEMONTOWER7F_ROCKET1',
  'POKEMONTOWER7F_ROCKET2',
  'POKEMONTOWER7F_ROCKET3',
]);

const LEAVES_AFTER_BATTLE = 'Leaves after the battle';

const PRESENCE = {
  OAKSLAB_RIVAL: LEAVES_AFTER_BATTLE,
  ROUTE22_RIVAL1:
    'Only appears after you get the Pokédex, leaves after the battle',
  ROUTE22_RIVAL2:
    'Only appears after you beat Giovanni at the Viridian Gym, leaves after the battle',
  CERULEANCITY_RIVAL:
    'Only appears when you reach Nugget Bridge, leaves after the battle',
  CERULEANCITY_ROCKET: LEAVES_AFTER_BATTLE,
  SSANNE2F_RIVAL:
    "Only appears when you head for the captain's cabin, leaves after the battle",
  POKEMONTOWER2F_RIVAL: LEAVES_AFTER_BATTLE,
  POKEMONTOWER7F_ROCKET1: LEAVES_AFTER_BATTLE,
  POKEMONTOWER7F_ROCKET2: LEAVES_AFTER_BATTLE,
  POKEMONTOWER7F_ROCKET3: LEAVES_AFTER_BATTLE,
  POKEMONTOWER7F_JESSIE: LEAVES_AFTER_BATTLE,
  MTMOONB2F_JESSIE:
    'Only appears after you beat the Super Nerd guarding the fossils, leaves after the battle',
  GAMECORNER_ROCKET: LEAVES_AFTER_BATTLE,
  ROCKETHIDEOUTB4F_GIOVANNI: LEAVES_AFTER_BATTLE,
  VIRIDIANGYM_GIOVANNI: LEAVES_AFTER_BATTLE,
  SILPHCO11F_GIOVANNI: LEAVES_AFTER_BATTLE,
};

const SILPH_TRAINER = /^SILPHCO\d+F_/;

const presenceFor = (object) =>
  PRESENCE[object] ??
  (SILPH_TRAINER.test(object)
    ? 'Leaves after you beat Giovanni in Silph Co.'
    : undefined);

const eliteFourDialog = (before, end, after, leave) => [
  { label: 'Before battle', texts: [before] },
  { label: 'If you win', texts: [end] },
  { label: 'After battle', texts: [after] },
  ...(leave
    ? [{ label: 'If you try to leave before the battle', texts: [leave] }]
    : []),
];

const OBJECT_DIALOG = {
  LORELEISROOM_LORELEI: eliteFourDialog(
    '_LoreleisRoomLoreleiBeforeBattleText',
    '_LoreleisRoomLoreleiEndBattleText',
    '_LoreleisRoomLoreleiAfterBattleText',
    '_LoreleisRoomLoreleiDontRunAwayText',
  ),
  BRUNOSROOM_BRUNO: eliteFourDialog(
    '_BrunoBeforeBattleText',
    '_BrunoEndBattleText',
    '_BrunoAfterBattleText',
    '_BrunosRoomBrunoDontRunAwayText',
  ),
  AGATHASROOM_AGATHA: eliteFourDialog(
    '_AgathaBeforeBattleText',
    '_AgathaEndBattleText',
    '_AgathaAfterBattleText',
    '_AgathasRoomAgathaDontRunAwayText',
  ),
  LANCESROOM_LANCE: eliteFourDialog(
    '_LancesRoomLanceBeforeBattleText',
    '_LancesRoomLanceEndBattleText',
    '_LancesRoomLanceAfterBattleText',
  ),
  VERMILIONGYM_LT_SURGE: [
    { label: 'Before battle', texts: ['_VermilionGymLTSurgePreBattleText'] },
    {
      label: 'If you win, he gives you the Thunder Badge and TM24',
      texts: [
        '_VermilionGymLTSurgeReceivedThunderBadgeText',
        '_VermilionGymLTSurgeThunderBadgeInfoText',
        '_VermilionGymLTSurgeReceivedTM24Text',
        '_TM24ExplanationText',
      ],
      gift: { name: 'TM24' },
    },
    {
      label: 'If your bag is full',
      texts: ['_VermilionGymLTSurgeTM24NoRoomText'],
    },
    {
      label: 'After battle',
      texts: ['_VermilionGymLTSurgePostBattleAdviceText'],
    },
  ],
  ROUTE24_COOLTRAINER_M1: [
    {
      label: 'After you beat the 5 bridge trainers, he gives you a Nugget',
      texts: [
        '_Route24CooltrainerM1YouBeatOurContestText',
        '_Route24CooltrainerM1YouJustEarnedAPrizeText',
        '_Route24CooltrainerM1ReceivedNuggetText',
      ],
      gift: { name: 'Nugget' },
    },
    {
      label: 'If your bag is full',
      texts: ['_Route24CooltrainerM1NoRoomText'],
    },
    {
      label: 'Before battle',
      texts: ['_Route24CooltrainerM1JoinTeamRocketText'],
    },
    { label: 'If you win', texts: ['_Route24CooltrainerM1DefeatedText'] },
    {
      label: 'After battle',
      texts: ['_Route24CooltrainerM1YouCouldBecomeATopLeaderText'],
    },
  ],
  CERULEANCITY_ROCKET: [
    { label: 'Before battle', texts: ['_CeruleanCityRocketText'] },
    { label: 'If you win', texts: ['_CeruleanCityRocketIGiveUpText'] },
    {
      label: 'After battle, he returns TM28',
      texts: [
        '_CeruleanCityRocketIllReturnTheTMText',
        '_CeruleanCityRocketReceivedTM28Text',
        '_CeruleanCityRocketIBetterGetMovingText',
      ],
      gift: { name: 'TM28' },
    },
    {
      label: 'If your bag is full',
      texts: ['_CeruleanCityRocketTM28NoRoomText'],
    },
  ],
  CERULEANGYM_MISTY: [
    { label: 'Before battle', texts: ['_CeruleanGymMistyPreBattleText'] },
    {
      label: 'If you win, she gives you the Cascade Badge and TM11',
      texts: [
        '_CeruleanGymMistyReceivedCascadeBadgeText',
        '_CeruleanGymMistyCascadeBadgeInfoText',
        '_CeruleanGymMistyReceivedTM11Text',
        '_CeruleanGymMistyTM11ExplanationText',
      ],
      gift: { name: 'TM11' },
    },
    {
      label: 'If your bag is full',
      texts: ['_CeruleanGymMistyTM11NoRoomText'],
    },
    { label: 'After battle', texts: ['_CeruleanGymMistyTM11ExplanationText'] },
  ],
  MTMOONB2F_SUPER_NERD: [
    {
      label: 'Before battle',
      texts: ['_MtMoonB2FSuperNerdTheyreBothMineText'],
    },
    { label: 'If you win', texts: ['_MtMoonB2FSuperNerdOkIllShareText'] },
    {
      label: 'After battle, before you pick a fossil',
      texts: ['_MtMoonB2fSuperNerdEachTakeOneText'],
    },
    {
      label: 'After you pick a fossil',
      texts: ['_MtMoonB2FSuperNerdTheresAPokemonLabText'],
    },
  ],
  PEWTERGYM_BROCK: [
    { label: 'Before battle', texts: ['_PewterGymBrockPreBattleText'] },
    {
      label: 'If you win, he gives you the Boulder Badge and TM34',
      texts: [
        '_PewterGymBrockReceivedBoulderBadgeText',
        '_PewterGymBrockBoulderBadgeInfoText',
        '_PewterGymBrockWaitTakeThisText',
        '_PewterGymReceivedTM34Text',
        '_TM34ExplanationText',
      ],
      gift: { name: 'TM34' },
    },
    { label: 'If your bag is full', texts: ['_PewterGymTM34NoRoomText'] },
    { label: 'After battle', texts: ['_PewterGymBrockPostBattleAdviceText'] },
  ],
  VIRIDIANGYM_GIOVANNI: [
    { label: 'Before battle', texts: ['_ViridianGymGiovanniPreBattleText'] },
    {
      label: 'If you win, he gives you the Earth Badge and TM27',
      texts: [
        '_ViridianGymGiovanniReceivedEarthBadgeText',
        '_ViridianGymGiovanniEarthBadgeInfoText',
        '_ViridianGymGiovanniReceivedTM27Text',
        '_ViridianGymGiovanniTM27ExplanationText',
      ],
      gift: { name: 'TM27' },
    },
    {
      label: 'If your bag is full',
      texts: ['_ViridianGymGiovanniTM27NoRoomText'],
    },
    {
      label: 'After battle, he leaves the gym',
      texts: ['_ViridianGymGiovanniPostBattleAdviceText'],
    },
  ],
};

const scripted = [
  {
    script: 'OaksLab',
    trainer: 'RIVAL1',
    teams: { ...rb([1, 2, 3]), yellow: [1] },
    path: 'pallet-town/oaks-lab',
    object: 'OAKSLAB_RIVAL',
    dialog: [
      { label: 'Before battle', texts: ['_OaksLabRivalIllTakeYouOnText'] },
      {
        label: 'If you win',
        texts: ['_OaksLabRivalIPickedTheWrongPokemonText'],
      },
      { label: 'If you lose', texts: ['_OaksLabRivalAmIGreatOrWhatText'] },
      { label: 'After battle', texts: ['_OaksLabRivalSmellYouLaterText'] },
    ],
  },
  {
    script: 'Route22',
    trainer: 'RIVAL1',
    teams: { ...rb([4, 5, 6]), yellow: [2] },
    object: 'ROUTE22_RIVAL1',
    dialog: [
      { label: 'Before battle', texts: ['_Route22RivalBeforeBattleText1'] },
      { label: 'If you win', texts: ['_Route22Rival1DefeatedText'] },
      { label: 'If you lose', texts: ['_Route22Rival1VictoryText'] },
      { label: 'After battle', texts: ['_Route22RivalAfterBattleText1'] },
    ],
  },
  {
    script: 'CeruleanCity',
    trainer: 'RIVAL1',
    teams: { ...rb([7, 8, 9]), yellow: [3] },
    object: 'CERULEANCITY_RIVAL',
    dialog: [
      { label: 'Before battle', texts: ['_CeruleanCityRivalPreBattleText'] },
      { label: 'If you win', texts: ['_CeruleanCityRivalDefeatedText'] },
      { label: 'If you lose', texts: ['_CeruleanCityRivalVictoryText'] },
      { label: 'After battle', texts: ['_CeruleanCityRivalIWentToBillsText'] },
    ],
  },
  {
    script: 'SSAnne2F',
    trainer: 'RIVAL2',
    teams: { ...rb([1, 2, 3]), yellow: [1] },
    object: 'SSANNE2F_RIVAL',
    shift: { x: 1 },
    dialog: [
      { label: 'Before battle', texts: ['_SSAnne2FRivalText'] },
      { label: 'If you win', texts: ['_SSAnne2FRivalDefeatedText'] },
      { label: 'If you lose', texts: ['_SSAnne2FRivalVictoryText'] },
      { label: 'After battle', texts: ['_SSAnne2FRivalCutMasterText'] },
    ],
  },
  {
    script: 'PokemonTower2F',
    trainer: 'RIVAL2',
    teams: { ...rb([4, 5, 6]), yellow: [2, 3, 4] },
    object: 'POKEMONTOWER2F_RIVAL',
    dialog: [
      {
        label: 'Before battle',
        texts: ['_PokemonTower2FRivalWhatBringsYouHereText'],
      },
      { label: 'If you win', texts: ['_PokemonTower2FRivalDefeatedText'] },
      { label: 'If you lose', texts: ['_PokemonTower2FRivalVictoryText'] },
      {
        label: 'After battle',
        texts: ['_PokemonTower2FRivalHowsYourDexText'],
      },
    ],
  },
  {
    script: 'SilphCo7F',
    trainer: 'RIVAL2',
    teams: { ...rb([7, 8, 9]), yellow: [5, 6, 7] },
  },
  {
    script: 'Route22',
    trainer: 'RIVAL2',
    teams: { ...rb([10, 11, 12]), yellow: [8, 9, 10] },
    object: 'ROUTE22_RIVAL2',
    dialog: [
      { label: 'Before battle', texts: ['_Route22RivalBeforeBattleText2'] },
      { label: 'If you win', texts: ['_Route22Rival2DefeatedText'] },
      { label: 'If you lose', texts: ['_Route22Rival2VictoryText'] },
      { label: 'After battle', texts: ['_Route22RivalAfterBattleText2'] },
    ],
  },
  {
    script: 'ChampionsRoom',
    trainer: 'RIVAL3',
    teams: { ...rb([1, 2, 3]), yellow: [1, 2, 3] },
    object: 'CHAMPIONSROOM_RIVAL',
    dialog: [
      { label: 'Before battle', texts: ['_ChampionsRoomRivalIntroText'] },
      { label: 'If you win', texts: ['_RivalDefeatedText'] },
      { label: 'If you lose', texts: ['_RivalVictoryText'] },
      {
        label: 'After battle',
        texts: ['_ChampionsRoomRivalAfterBattleText'],
      },
    ],
  },
  ...[
    [
      'MtMoonB2F',
      0x2a,
      'MTMOONB2F_JESSIE',
      [
        {
          label: 'Before battle',
          texts: ['_MtMoonJessieJamesText1', '_MtMoonJessieJamesText2'],
        },
        { label: 'If you win', texts: ['_MtMoonJessieJamesText3'] },
        { label: 'After battle', texts: ['_MtMoonJessieJamesText4'] },
      ],
    ],
    ['RocketHideoutB4F', 0x2b],
    [
      'PokemonTower7F',
      0x2c,
      'POKEMONTOWER7F_JESSIE',
      [
        {
          label: 'Before battle',
          texts: [
            '_PokemonTowerJessieJamesText1',
            '_PokemonTowerJessieJamesText2',
          ],
        },
        { label: 'If you win', texts: ['_PokemonTowerJessieJamesText3'] },
        { label: 'After battle', texts: ['_PokemonTowerJessieJamesText4'] },
      ],
    ],
    ['SilphCo11F', 0x2d],
  ].map(([script, index, object, dialog]) => ({
    script,
    trainer: 'ROCKET',
    name: 'Jessie & James',
    sprite: 'JESSIE',
    teams: { yellow: [index] },
    ...(object && { object, dialog }),
  })),
];

const parseParties = (game) => {
  const classes = [
    ...read(game.dir, 'constants/trainer_constants.asm').matchAll(
      /^\s*trainer_const (\w+)/gm,
    ),
  ]
    .map(([, constant]) => constant)
    .filter((constant) => constant !== 'NOBODY');
  const text = forGame(
    read(game.dir, 'data/trainers/parties.asm'),
    game.define,
  );
  const labels = text
    .filter((line) => /^dw \w+Data$/.test(line))
    .map((line) => line.slice(3));
  const names = [
    ...read(game.dir, 'data/trainers/names.asm').matchAll(/^\s*li "(.+)"/gm),
  ].map(([, name]) => name);

  if (labels.length !== classes.length || names.length !== classes.length)
    throw new Error(
      `${game.id}: ${classes.length} trainer classes, ${labels.length} party pointers, ${names.length} names`,
    );

  const partiesByLabel = new Map();
  let current = null;

  for (const line of text) {
    const label = line.match(/^(\w+Data):$/);

    if (label) {
      current = [];
      partiesByLabel.set(label[1], current);
    } else if (current && line.startsWith('db ')) {
      current.push(parseParty(line));
    }
  }

  return new Map(
    classes.map((constant, index) => [
      constant,
      {
        name: trainerName(constant, names[index]),
        parties: partiesByLabel.get(labels[index]) ?? [],
      },
    ]),
  );
};

const speciesNumber = (constant) => {
  const number = dexNumbers.get(constant);

  if (!number) throw new Error(`Unknown species ${constant}`);

  return number;
};

const parseParty = (line) => {
  const values = line
    .slice(3)
    .split(',')
    .map((value) => value.trim());

  if (values.at(-1) !== '0') throw new Error(`Unterminated party: ${line}`);

  const body = values.slice(0, -1);

  if (body[0] === '$FF') {
    const pairs = body.slice(1);

    return Object.assign(
      Array.from({ length: pairs.length / 2 }, (_, index) => ({
        species: pairs[index * 2 + 1],
        level: Number(pairs[index * 2]),
      })),
      { special: true },
    );
  }

  return body.slice(1).map((species) => ({ species, level: Number(body[0]) }));
};

const battles = [];

for (const game of games) {
  const trainers = parseParties(game);
  const movesFor = trainerMoves(game);

  const partyFor = (file, trainer, index) => {
    const party = trainers.get(trainer)?.parties[index - 1];

    if (!party) throw new Error(`${game.id}: no party ${trainer} #${index}`);

    const moves = movesFor({ file, trainer, index, party });

    return party.map((pokemon, slot) => ({ ...pokemon, moves: moves[slot] }));
  };

  const addBattle = ({
    file,
    slot,
    trainer,
    name,
    parties,
    sprite,
    position,
    path = locationFor(constantFromFile(file)),
    dialog = [],
    choicePrompt,
    cutscene,
    presence,
  }) => {
    const map = constantFromFile(file);
    const floor = floorFor(map);
    const placed =
      position && hasOwnMapImage(game.dir, map, path, floor) ? position : {};

    battles.push({
      game: game.id,
      slot,
      name: name ?? trainers.get(trainer).name,
      trainerClass: trainer.toLowerCase().replaceAll('_', '-'),
      path,
      area: areaFor(file, path),
      ...(floor && { floor }),
      ...placed,
      ...(cutscene && placed.x !== undefined && { cutscene }),
      ...(presence && { presence }),
      ...(sprite && { sprite: spritePath(game, sprite) }),
      ...(dialog.length > 0 && { dialog }),
      ...(choicePrompt && { choicePrompt }),
      parties: parties.map(({ label, choice, party }) => ({
        ...(label && { label }),
        ...(choice && { choice }),
        pokemon: party.map(({ species, level, moves }) => ({
          number: speciesNumber(species),
          level,
          moves,
        })),
      })),
    });
  };

  const battleDialog = (dialog = []) =>
    dialog.flatMap(({ label, texts, gift }) => {
      const text = texts
        .map((far) => farText(game, far))
        .filter(Boolean)
        .join('\n\n');

      return text
        ? [
            {
              label,
              text,
              ...(gift && {
                gift: {
                  ...gift,
                  sprite: spritePath(game, gift.sprite ?? 'POKE_BALL'),
                },
              }),
            },
          ]
        : [];
    });

  const objectDialog = (file, textId) => {
    if (OBJECT_DIALOG[textId]) return battleDialog(OBJECT_DIALOG[textId]);
    if (!TRAINER_DIALOG_MAPS.has(file)) return [];

    const texts = trainerTexts(game, file, textId);

    return [
      { label: 'Before battle', text: texts?.battle },
      { label: 'If you win', text: texts?.end },
      { label: 'After battle', text: texts?.after },
    ].filter(({ text }) => text);
  };

  for (const fileName of readdirSync(join(game.dir, 'data/maps/objects'))) {
    const file = basename(fileName, '.asm');
    const objects = [
      ...read(game.dir, `data/maps/objects/${fileName}`).matchAll(
        /^\s*object_event\s+(\d+),\s*(\d+),\s*SPRITE_(\w+),\s*\w+,\s*(\w+),\s*TEXT_(\w+),\s*OPP_(\w+),\s*(\d+)$/gm,
      ),
    ];

    objects.forEach(
      ([, x, y, sprite, direction, textId, trainer, index], slot) => {
        if (trainer.startsWith('RIVAL')) return;

        addBattle({
          file,
          slot,
          trainer,
          sprite,
          position: {
            x: Number(x),
            y: Number(y),
            facing: facings[direction] ?? 'down',
          },
          dialog: objectDialog(file, textId),
          cutscene: CUTSCENE_OBJECTS.has(textId),
          presence: presenceFor(textId),
          parties: [{ party: partyFor(file, trainer, Number(index)) }],
        });
      },
    );
  }

  const found = [];

  for (const fileName of readdirSync(join(game.dir, 'scripts'))) {
    for (const [, trainer] of read(game.dir, `scripts/${fileName}`).matchAll(
      /ld a, OPP_(\w+)\n\s*ld \[wCurOpponent\], a/g,
    )) {
      found.push(`${basename(fileName, '.asm')}|${trainer}`);
    }
  }

  const listed = scripted
    .filter(({ teams }) => teams[game.id])
    .map(({ script, trainer }) => `${script}|${trainer}`);

  if (found.sort().join() !== listed.sort().join())
    throw new Error(
      `${game.id}: scripted battles in source [${found}] do not match the list [${listed}]`,
    );

  const hiddenObjects = new Set(
    [
      ...read(game.dir, 'data/maps/toggleable_objects.asm').matchAll(
        /toggle_object_state\s+(\w+),\s*OFF/g,
      ),
    ].map(([, name]) => name),
  );

  const objectPosition = (script, object) => {
    const [, x, y, direction] =
      read(game.dir, `data/maps/objects/${script}.asm`).match(
        new RegExp(
          `object_event\\s+(\\d+),\\s*(\\d+),\\s*SPRITE_\\w+,\\s*\\w+,\\s*(\\w+),\\s*TEXT_${object}\\b`,
        ),
      ) ?? [];

    return x === undefined
      ? undefined
      : { x: Number(x), y: Number(y), facing: facings[direction] ?? 'down' };
  };

  const shifted = (position, shift) =>
    position && shift
      ? {
          ...position,
          x: position.x + (shift.x ?? 0),
          y: position.y + (shift.y ?? 0),
        }
      : position;

  for (const {
    script,
    trainer,
    name,
    sprite,
    teams,
    path,
    object,
    shift,
    dialog,
  } of scripted) {
    const indices = teams[game.id];

    if (!indices) continue;
    if (!existsSync(join(game.dir, `scripts/${script}.asm`)))
      throw new Error(`${game.id}: missing scripts/${script}.asm`);

    const variants = indices.length > 1;

    addBattle({
      file: script,
      slot: -1,
      trainer,
      name,
      sprite: sprite ?? (trainer.startsWith('RIVAL') ? 'BLUE' : undefined),
      ...(path && { path }),
      ...(object && {
        position: shifted(objectPosition(script, object), shift),
        cutscene: hiddenObjects.has(object),
        presence: presenceFor(object),
      }),
      dialog: battleDialog(dialog),
      ...(variants && { choicePrompt: rivalChoices[game.id].prompt }),
      parties: indices.map((index, variant) => {
        const party = partyFor(script, trainer, index);

        if (variants) {
          const signature = rivalTeamSignature[game.id][variant];

          if (!signature.includes(party.at(-1).species))
            throw new Error(
              `${game.id}: ${script} team ${index} ends with ${party.at(-1).species}, expected one of ${signature}`,
            );
        }

        if (!variants) return { party };

        const { label, species } = rivalChoices[game.id];

        return {
          label: `${label} ${speciesName(species[variant])}`,
          choice: speciesNumber(species[variant]),
          party,
        };
      }),
    });
  }
}

const merged = new Map();

for (const { game, slot, ...battle } of battles) {
  const key = JSON.stringify([battle, slot]);
  const current = merged.get(key) ?? { battle: { ...battle, games: [] }, slot };

  current.battle.games.push(game);
  merged.set(key, current);
}

const collator = new Intl.Collator('en', { numeric: true });

const trainerBattles = [...merged.values()]
  .sort(
    (a, b) =>
      collator.compare(a.battle.path, b.battle.path) ||
      collator.compare(a.battle.area ?? '', b.battle.area ?? '') ||
      a.slot - b.slot,
  )
  .map(({ battle }) => battle);

writeFileSync(OUTPUT, `${JSON.stringify(trainerBattles, null, 2)}\n`);

console.log(
  `Wrote ${trainerBattles.length} trainer battles to ${OUTPUT.pathname}`,
);
console.log(
  games
    .map(
      ({ id }) =>
        `${id}: ${battles.filter((battle) => battle.game === id).length} battles`,
    )
    .join(', '),
);
