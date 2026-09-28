import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import {
  constantFromFile,
  floorFor,
  forGame,
  games,
  hasOwnMapImage,
  locationFor,
  pokeredDir,
  read,
} from '../rby/disassembly.mjs';
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
  OaksLab: "Oak's Lab",
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

const rivalLabels = {
  red: ['Charmander', 'Squirtle', 'Bulbasaur'].map(
    (starter) => `If you chose ${starter}`,
  ),
  blue: ['Charmander', 'Squirtle', 'Bulbasaur'].map(
    (starter) => `If you chose ${starter}`,
  ),
  yellow: ['Jolteon', 'Flareon', 'Vaporeon'].map(
    (evolution) => `If Eevee becomes ${evolution}`,
  ),
};

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

const scripted = [
  {
    script: 'OaksLab',
    trainer: 'RIVAL1',
    teams: { ...rb([1, 2, 3]), yellow: [1] },
  },
  {
    script: 'Route22',
    trainer: 'RIVAL1',
    teams: { ...rb([4, 5, 6]), yellow: [2] },
  },
  {
    script: 'CeruleanCity',
    trainer: 'RIVAL1',
    teams: { ...rb([7, 8, 9]), yellow: [3] },
  },
  {
    script: 'SSAnne2F',
    trainer: 'RIVAL2',
    teams: { ...rb([1, 2, 3]), yellow: [1] },
  },
  {
    script: 'PokemonTower2F',
    trainer: 'RIVAL2',
    teams: { ...rb([4, 5, 6]), yellow: [2, 3, 4] },
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
  },
  {
    script: 'ChampionsRoom',
    trainer: 'RIVAL3',
    teams: { ...rb([1, 2, 3]), yellow: [1, 2, 3] },
  },
  ...[
    ['MtMoonB2F', 0x2a],
    ['RocketHideoutB4F', 0x2b],
    ['PokemonTower7F', 0x2c],
    ['SilphCo11F', 0x2d],
  ].map(([script, index]) => ({
    script,
    trainer: 'ROCKET',
    name: 'Jessie & James',
    teams: { yellow: [index] },
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

  const addBattle = ({ file, slot, trainer, name, parties, position }) => {
    const map = constantFromFile(file);
    const path = locationFor(map);
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
      parties: parties.map(({ label, party }) => ({
        ...(label && { label }),
        pokemon: party.map(({ species, level, moves }) => ({
          number: speciesNumber(species),
          level,
          moves,
        })),
      })),
    });
  };

  for (const fileName of readdirSync(join(game.dir, 'data/maps/objects'))) {
    const file = basename(fileName, '.asm');
    const objects = [
      ...read(game.dir, `data/maps/objects/${fileName}`).matchAll(
        /^\s*object_event\s+(\d+),\s*(\d+),.*, TEXT_\w+, OPP_(\w+), (\d+)$/gm,
      ),
    ];

    objects.forEach(([, x, y, trainer, index], slot) => {
      if (trainer.startsWith('RIVAL')) return;

      addBattle({
        file,
        slot,
        trainer,
        position: { x: Number(x), y: Number(y) },
        parties: [{ party: partyFor(file, trainer, Number(index)) }],
      });
    });
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

  for (const { script, trainer, name, teams } of scripted) {
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
      parties: indices.map((index, variant) => {
        const party = partyFor(script, trainer, index);

        if (variants) {
          const signature = rivalTeamSignature[game.id][variant];

          if (!signature.includes(party.at(-1).species))
            throw new Error(
              `${game.id}: ${script} team ${index} ends with ${party.at(-1).species}, expected one of ${signature}`,
            );
        }

        return {
          label: variants ? rivalLabels[game.id][variant] : undefined,
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
