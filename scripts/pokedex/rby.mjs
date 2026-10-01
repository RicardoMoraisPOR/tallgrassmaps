import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import {
  constantFromFile,
  displayName,
  floorFor,
  forGame,
  games,
  locationFor,
  pokeredDir,
  read,
} from '../rby/disassembly.mjs';

const OUTPUT = new URL('../../src/data/pokedex/rby/rby.json', import.meta.url);
const MASTER = new URL(
  '../../src/data/pokedex/master-data.json',
  import.meta.url,
);

const master = new Map(
  JSON.parse(readFileSync(MASTER, 'utf8')).map((entry) => [
    entry.number,
    entry,
  ]),
);

const overrides = (number, name, types) => {
  const base = master.get(number);

  if (!base) throw new Error(`Pokémon #${number} is missing from master data`);

  return {
    ...(name !== base.name && { name }),
    ...(types.join() !== base.types.join() && { types }),
  };
};

const EXPECTED_OBTAINABLE = { red: 135, blue: 135, yellow: 134 };

const typeNames = { PSYCHIC_TYPE: 'psychic' };

const species = new Map();

for (const file of readdirSync(join(pokeredDir, 'data/pokemon/base_stats'))) {
  const text = read(pokeredDir, `data/pokemon/base_stats/${file}`);
  const constant = text.match(/db DEX_(\w+)/)[1];
  const types = text.match(/db (\w+), (\w+) ; type/).slice(1);
  const number = Number(
    read(pokeredDir, 'constants/pokedex_constants.asm').match(
      new RegExp(`const DEX_${constant}\\s*; (\\d+)`),
    )[1],
  );

  species.set(constant, {
    number,
    name: displayName(constant),
    types: [...new Set(types)].map(
      (type) => typeNames[type] ?? type.toLowerCase(),
    ),
    evolutions: [],
    encounters: [],
  });
}

const slotWeights = [
  ...read(pokeredDir, 'data/wild/probabilities.asm').matchAll(
    /^\s*wild_chance\s+(\d+)/gm,
  ),
].map(([, weight]) => Number(weight));

if (slotWeights.reduce((sum, weight) => sum + weight, 0) !== 256) {
  throw new Error('Wild slot weights do not add up to 256');
}

const slotChances = new Map();

const evolutionText = read(pokeredDir, 'data/pokemon/evos_moves.asm');

for (const [, label, body] of evolutionText.matchAll(
  /^(\w+)EvosMoves:\n; Evolutions\n([\s\S]*?)\tdb 0/gm,
)) {
  const from = [...species.keys()].find(
    (constant) => constant.replaceAll('_', '') === label.toUpperCase(),
  );

  for (const line of body
    .split('\n')
    .filter((row) => row.includes('EVOLVE_'))) {
    const [kind, ...args] = line
      .replace(/^\s*db\s*/, '')
      .split(',')
      .map((part) => part.trim());
    const to = args.at(-1);
    const method = kind.replace('EVOLVE_', '').toLowerCase();

    species.get(from).evolutions.push({
      to,
      method,
      ...(method === 'level' && { level: Number(args[0]) }),
      ...(method === 'item' && {
        item: args[0].toLowerCase().replaceAll('_', ' '),
      }),
    });
  }
}

const addEncounter = (constant, encounter) => {
  const entry = species.get(constant);

  if (!entry) throw new Error(`Unknown species ${constant}`);

  entry.encounters.push(encounter);
};

for (const game of games) {
  const mapConstants = [
    ...read(game.dir, 'constants/map_constants.asm').matchAll(
      /^\s*map_const (\w+),/gm,
    ),
  ].map(([, constant]) => constant);
  const labels = [
    ...read(game.dir, 'data/wild/grass_water.asm').matchAll(
      /^\s*dw (\w+)WildMons/gm,
    ),
  ].map(([, label]) => label);
  const pointers = new Map();

  if (labels.length !== mapConstants.length)
    throw new Error(
      `${game.id}: ${labels.length} wild pointers for ${mapConstants.length} maps`,
    );

  labels.forEach((label, index) => {
    if (label !== 'Nothing')
      pointers.set(label, [
        ...(pointers.get(label) ?? []),
        mapConstants[index],
      ]);
  });

  for (const file of readdirSync(join(game.dir, 'data/wild/maps'))) {
    const label = basename(file, '.asm');
    const maps = pointers.get(label);

    if (!maps) continue;

    let method = null;
    let slotIndex = 0;

    for (const line of forGame(
      read(game.dir, `data/wild/maps/${file}`),
      game.define,
    )) {
      if (line.startsWith('def_grass_wildmons')) method = 'walk';
      else if (line.startsWith('def_water_wildmons')) method = 'surf';
      else if (line.startsWith('end_')) method = null;
      else {
        const slot = line.match(/^db\s+(\d+), (\w+)$/);

        if (slot && method) {
          const chance = (slotWeights[slotIndex] / 256) * 100;

          for (const map of maps) {
            const key = `${game.id}|${map}|${method}`;

            slotChances.set(key, (slotChances.get(key) ?? 0) + chance);
            addEncounter(slot[2], {
              method,
              path: locationFor(map),
              map,
              game: game.id,
              level: Number(slot[1]),
              chance,
            });
          }

          slotIndex++;
        }
      }

      if (method === null) slotIndex = 0;
    }
  }

  const goodRodSlots = forGame(
    read(game.dir, 'data/wild/good_rod.asm'),
    game.define,
  )
    .map((line) => line.match(/^db\s+(\d+), (\w+)$/))
    .filter(Boolean);

  for (const [, level, constant] of goodRodSlots) {
    addEncounter(constant, {
      method: 'good-rod',
      path: null,
      game: game.id,
      level: Number(level),
      chance: 100 / goodRodSlots.length,
    });
  }

  addEncounter('MAGIKARP', {
    method: 'old-rod',
    path: null,
    game: game.id,
    level: 5,
    chance: 100,
  });

  const superRod = read(game.dir, 'data/wild/super_rod.asm');

  if (superRod.includes('SuperRodFishingSlots')) {
    for (const [, map, slots] of superRod.matchAll(
      /db (\w+), ((?:\w+, \d+(?:, )?)+)$/gm,
    )) {
      const mapSlots = [...slots.matchAll(/(\w+), (\d+)/g)];

      for (const [, constant, level] of mapSlots) {
        addEncounter(constant, {
          method: 'super-rod',
          path: locationFor(map),
          map,
          game: game.id,
          level: Number(level),
          chance: 100 / mapSlots.length,
        });
      }
    }
  } else {
    const groups = new Map();

    for (const block of superRod.split(/^\./m).slice(1)) {
      const name = block.match(/^(Group\d+):/)?.[1];

      if (name) {
        groups.set(
          name,
          [...block.matchAll(/db (\d+), (\w+)/g)].map(
            ([, level, constant]) => ({ level: Number(level), constant }),
          ),
        );
      }
    }

    for (const [, map, group] of superRod.matchAll(
      /dbw (\w+),\s+\.(Group\d+)/g,
    )) {
      const groupSlots = groups.get(group);

      for (const { level, constant } of groupSlots) {
        addEncounter(constant, {
          method: 'super-rod',
          path: locationFor(map),
          map,
          game: game.id,
          level,
          chance: 100 / groupSlots.length,
        });
      }
    }
  }

  for (const line of read(game.dir, 'data/events/trades.asm').split('\n')) {
    const trade = line.match(/npctrade (\w+),\s+(\w+),.*; used in (\w+)/);

    if (trade) {
      const encounter = {
        method: 'trade',
        path: locationFor(trade[3]),
        game: game.id,
        tradeFor: trade[1],
      };

      addEncounter(trade[2], encounter);

      for (const evolution of species.get(trade[2]).evolutions) {
        if (evolution.method === 'trade') addEncounter(evolution.to, encounter);
      }
    }
  }

  const prizes = forGame(read(game.dir, 'data/events/prizes.asm'), game.define);
  let inMonMenu = false;

  for (const line of prizes) {
    if (/^PrizeMenuMon\dEntries:/.test(line)) inMonMenu = true;
    else if (/^\w+:/.test(line)) inMonMenu = false;
    else if (inMonMenu && /^db [A-Z_]+$/.test(line)) {
      addEncounter(line.slice(3), {
        method: 'prize',
        path: 'celadon-city/rocket-game-corner',
        game: game.id,
      });
    }
  }

  for (const file of readdirSync(join(game.dir, 'scripts'))) {
    const text = read(game.dir, `scripts/${file}`);

    for (const [, constant, level] of text.matchAll(
      /lb bc, (\w+), (\d+)\n(?:.*\n){0,3}?\s*call GivePokemon/g,
    )) {
      addEncounter(constant, {
        method: 'gift',
        path: locationFor(constantFromFile(file)),
        game: game.id,
        level: Number(level),
      });
    }
  }

  for (const file of readdirSync(join(game.dir, 'data/maps/objects'))) {
    for (const [, constant, level] of read(
      game.dir,
      `data/maps/objects/${file}`,
    ).matchAll(/object_event .*, TEXT_\w+, ([A-Z][A-Z_]+), (\d+)$/gm)) {
      if (species.has(constant)) {
        addEncounter(constant, {
          method: 'static',
          path: locationFor(constantFromFile(file)),
          game: game.id,
          level: Number(level),
        });
      }
    }
  }
}

const scripted = [
  {
    species: ['BULBASAUR', 'CHARMANDER', 'SQUIRTLE'],
    method: 'gift',
    path: 'pallet-town/oaks-lab',
    games: ['red', 'blue'],
    level: 5,
    source: 'scripts/OaksLab.asm',
  },
  {
    species: ['PIKACHU'],
    method: 'gift',
    path: 'pallet-town/oaks-lab',
    games: ['yellow'],
    level: 5,
    source: 'scripts/OaksLab.asm',
  },
  {
    species: ['HITMONLEE', 'HITMONCHAN'],
    method: 'gift',
    path: 'saffron-city',
    games: ['red', 'blue', 'yellow'],
    level: 30,
    source: 'scripts/FightingDojo.asm',
  },
  {
    species: ['OMANYTE', 'KABUTO', 'AERODACTYL'],
    method: 'fossil',
    path: 'cinnabar-island',
    games: ['red', 'blue', 'yellow'],
    level: 30,
    source: 'scripts/CinnabarLabFossilRoom.asm',
  },
  {
    species: ['KABUTO', 'OMANYTE'],
    method: 'fossil-item',
    path: 'route-4/mt-moon',
    map: 'MT_MOON_B2F',
    games: ['red', 'blue', 'yellow'],
    level: 30,
    source: 'scripts/MtMoonB2F.asm',
  },
  {
    species: ['AERODACTYL'],
    method: 'fossil-item',
    path: 'pewter-city/pewter-museum',
    map: 'MUSEUM_1F',
    games: ['red', 'blue', 'yellow'],
    level: 30,
    source: 'scripts/Museum1F.asm',
  },
  {
    species: ['SNORLAX'],
    method: 'static',
    path: 'route-12',
    games: ['red', 'blue', 'yellow'],
    level: 30,
    source: 'scripts/Route12.asm',
  },
  {
    species: ['SNORLAX'],
    method: 'static',
    path: 'route-16',
    games: ['red', 'blue', 'yellow'],
    level: 30,
    source: 'scripts/Route16.asm',
  },
];

for (const {
  species: constants,
  games: ids,
  source,
  ...encounter
} of scripted) {
  for (const id of ids) {
    const dir = games.find((game) => game.id === id).dir;

    if (!existsSync(join(dir, source)))
      throw new Error(`Missing ${source} in ${id}`);

    for (const constant of constants)
      addEncounter(constant, { ...encounter, game: id });
  }
}

const EVOLUTION_BLOCKED = { yellow: ['PIKACHU'] };

const obtainable = Object.fromEntries(
  games.map(({ id }) => {
    const owned = new Set(
      [...species]
        .filter(([, entry]) =>
          entry.encounters.some((encounter) => encounter.game === id),
        )
        .map(([constant]) => constant),
    );

    let grew = true;

    while (grew) {
      grew = false;

      for (const constant of [...owned]) {
        if (
          EVOLUTION_BLOCKED[id]?.includes(constant) &&
          !species
            .get(constant)
            .encounters.some(
              (encounter) =>
                encounter.game === id && encounter.method !== 'gift',
            )
        )
          continue;

        for (const evolution of species.get(constant).evolutions) {
          if (evolution.method !== 'trade' && !owned.has(evolution.to)) {
            owned.add(evolution.to);
            grew = true;
          }
        }
      }
    }

    return [id, owned];
  }),
);

for (const [id, expected] of Object.entries(EXPECTED_OBTAINABLE)) {
  if (obtainable[id].size !== expected) {
    const missing = [...species.keys()].filter(
      (constant) => !obtainable[id].has(constant),
    );

    throw new Error(
      `${id}: computed ${obtainable[id].size} obtainable, expected ${expected}. Not obtainable: ${missing.join(', ')}`,
    );
  }
}

const preEvolution = new Map();

for (const [constant, entry] of species) {
  for (const evolution of entry.evolutions)
    preEvolution.set(evolution.to, { from: constant, ...evolution });
}

for (const [key, total] of slotChances) {
  if (Math.abs(total - 100) > 0.001) {
    throw new Error(`${key}: wild slot chances add up to ${total}%`);
  }
}

const range = (values) => [Math.min(...values), Math.max(...values)];

const roundChance = (value) => Math.round(value * 10) / 10;

const floorCollator = new Intl.Collator('en', { numeric: true });

const mergeEncounters = (encounters) => {
  const perMap = new Map();

  for (const { game, level, chance, map, tradeFor, ...rest } of encounters) {
    const key = [game, rest.method, rest.path, tradeFor, map].join('|');
    const current = perMap.get(key) ?? {
      ...rest,
      game,
      tradeFor,
      floor: floorFor(map),
      levels: [],
    };

    if (level !== undefined) current.levels.push(level);
    if (chance !== undefined) current.chance = (current.chance ?? 0) + chance;

    perMap.set(key, current);
  }

  const perPlace = new Map();

  for (const {
    game,
    tradeFor,
    floor,
    levels,
    chance,
    ...rest
  } of perMap.values()) {
    const key = [game, rest.method, rest.path, tradeFor].join('|');
    const current = perPlace.get(key) ?? {
      ...rest,
      game,
      tradeFor,
      levels: [],
      chances: [],
      floors: [],
    };

    current.levels.push(...levels);
    if (chance !== undefined) current.chances.push(chance);
    if (floor) current.floors.push({ floor, levels, chance });

    perPlace.set(key, current);
  }

  const merged = new Map();

  for (const {
    game,
    tradeFor,
    levels,
    chances,
    floors,
    ...rest
  } of perPlace.values()) {
    const encounter = {
      ...rest,
      ...(tradeFor && { tradeFor: species.get(tradeFor).number }),
      ...(levels.length > 0 && { levels: range(levels) }),
      ...(chances.length > 0 && { chance: range(chances).map(roundChance) }),
      ...(floors.length > 0 && {
        floors: floors
          .sort((a, b) => floorCollator.compare(a.floor, b.floor))
          .map(({ floor, levels, chance }) => ({
            floor,
            ...(levels.length > 0 && { levels: range(levels) }),
            ...(chance !== undefined && {
              chance: [chance, chance].map(roundChance),
            }),
          })),
      }),
    };
    const key = JSON.stringify(encounter);
    const current = merged.get(key) ?? { ...encounter, games: [] };

    current.games.push(game);
    merged.set(key, current);
  }

  return [...merged.values()];
};

const pokedex = [...species]
  .map(([constant, entry]) => {
    const evolvesFrom = preEvolution.get(constant);

    return {
      number: entry.number,
      id: entry.number,
      ...overrides(entry.number, entry.name, entry.types),
      games: games
        .map(({ id }) => id)
        .filter((id) => obtainable[id].has(constant)),
      ...(evolvesFrom && {
        evolvesFrom: {
          number: species.get(evolvesFrom.from).number,
          id: species.get(evolvesFrom.from).number,
          method: evolvesFrom.method,
          ...(evolvesFrom.level && { level: evolvesFrom.level }),
          ...(evolvesFrom.item && { item: evolvesFrom.item }),
        },
      }),
      encounters: mergeEncounters(entry.encounters),
    };
  })
  .sort((a, b) => a.number - b.number);

writeFileSync(OUTPUT, `${JSON.stringify(pokedex, null, 2)}\n`);

console.log(`Wrote ${pokedex.length} Pokémon to ${OUTPUT.pathname}`);
console.log(
  Object.entries(obtainable)
    .map(([id, owned]) => `${id}: ${owned.size} obtainable`)
    .join(', '),
);
