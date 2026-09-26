import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUTPUT = new URL('../../src/data/pokedex/rby.json', import.meta.url);
const VENDOR = fileURLToPath(new URL('../../vendor/', import.meta.url));

const PRET_COMMITS = {
  pokered: 'd2704a63c26f9ba046ade877445216b3de0519a4',
  pokeyellow: 'e89ead154b9968aa50eed9328ff2b38b6c194382',
};

const EXPECTED_OBTAINABLE = { red: 135, blue: 135, yellow: 134 };

const vendor = async (repo) => {
  const commit = PRET_COMMITS[repo];
  const dir = join(VENDOR, repo);
  const marker = join(dir, '.pret-commit');

  if (existsSync(marker) && readFileSync(marker, 'utf8').trim() === commit) {
    return dir;
  }

  const response = await fetch(
    `https://codeload.github.com/pret/${repo}/tar.gz/${commit}`,
  );

  if (!response.ok) {
    throw new Error(`${response.status} downloading pret/${repo}@${commit}`);
  }

  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  execFileSync('tar', ['-xzf', '-', '--strip-components=1', '-C', dir], {
    input: Buffer.from(await response.arrayBuffer()),
  });
  writeFileSync(marker, `${commit}\n`);

  console.log(
    `Downloaded pret/${repo}@${commit.slice(0, 7)} to vendor/${repo}`,
  );

  return dir;
};

const pokeredDir = await vendor('pokered');
const pokeyellowDir = await vendor('pokeyellow');

const games = [
  { id: 'red', dir: pokeredDir, define: '_RED' },
  { id: 'blue', dir: pokeredDir, define: '_BLUE' },
  { id: 'yellow', dir: pokeyellowDir, define: '_YELLOW' },
];

const read = (dir, file) => readFileSync(join(dir, file), 'utf8');

const forGame = (text, define) => {
  const kept = [];
  const stack = [];

  for (const line of text.split('\n')) {
    const condition = line.match(/^\s*IF DEF\((\w+)\)/);

    if (condition) {
      stack.push(condition[1] === define);
    } else if (/^\s*ELSE\b/.test(line)) {
      stack.push(!stack.pop());
    } else if (/^\s*ENDC\b/.test(line)) {
      stack.pop();
    } else if (stack.every(Boolean)) {
      kept.push(line.replace(/;.*$/, '').trim());
    }
  }

  return kept.filter(Boolean);
};

const insideLocations = {
  VIRIDIAN_FOREST: 'route-2/viridian-forest',
  MT_MOON: 'route-4/mt-moon',
  CERULEAN_CAVE: 'cerulean-city/cerulean-cave',
  SS_ANNE: 'vermilion-city/ss-anne',
  DIGLETTS_CAVE: 'route-11/digletts-cave',
  ROCK_TUNNEL: 'route-10/rock-tunnel',
  POWER_PLANT: 'route-10/power-plant',
  POKEMON_TOWER: 'lavender-town/pokemon-tower',
  ROCKET_HIDEOUT: 'celadon-city/rocket-game-corner',
  GAME_CORNER: 'celadon-city/rocket-game-corner',
  SILPH_CO: 'saffron-city/silph-co',
  SAFARI_ZONE: 'fuchsia-city/safari-zone',
  POKEMON_MANSION: 'cinnabar-island/pokemon-mansion',
  SEAFOAM_ISLANDS: 'route-20/seafoam-islands',
  VICTORY_ROAD: 'route-23/victory-road',
};

const buildingLocations = {
  CERULEAN_GYM: 'cerulean-city',
  CERULEAN_TRADE_HOUSE: 'cerulean-city',
  CERULEAN_MELANIES_HOUSE: 'cerulean-city',
  VERMILION_DOCK: 'vermilion-city',
  VERMILION_TRADE_HOUSE: 'vermilion-city',
  CELADON_MANSION_ROOF_HOUSE: 'celadon-city',
  CINNABAR_LAB_FOSSIL_ROOM: 'cinnabar-island',
  CINNABAR_LAB_TRADE_ROOM: 'cinnabar-island',
  MT_MOON_POKECENTER: 'route-4',
  ROUTE_2_TRADE_HOUSE: 'route-2',
  UNDERGROUND_PATH_ROUTE_5: 'route-5',
  ROUTE_11_GATE_2F: 'route-11',
  ROUTE_18_GATE_2F: 'route-18',
  FIGHTING_DOJO: 'saffron-city',
  OAKS_LAB: 'pallet-town',
};

const TOWNS = [
  'PALLET_TOWN',
  'VIRIDIAN_CITY',
  'PEWTER_CITY',
  'CERULEAN_CITY',
  'LAVENDER_TOWN',
  'VERMILION_CITY',
  'CELADON_CITY',
  'FUCHSIA_CITY',
  'CINNABAR_ISLAND',
  'INDIGO_PLATEAU',
  'SAFFRON_CITY',
];

const locationFor = (mapConstant) => {
  if (buildingLocations[mapConstant]) return buildingLocations[mapConstant];
  if (TOWNS.includes(mapConstant))
    return mapConstant.toLowerCase().replaceAll('_', '-');

  const route = mapConstant.match(/^ROUTE_(\d+)$/);

  if (route) return `route-${route[1]}`;

  const inside = Object.keys(insideLocations).find((prefix) =>
    mapConstant.startsWith(prefix),
  );

  if (inside) return insideLocations[inside];

  throw new Error(`No location for map ${mapConstant}`);
};

const constantFromFile = (file) =>
  basename(file, '.asm')
    .replace(/_\d+$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-zA-Z])(\d)/g, '$1_$2')
    .toUpperCase();

const specialNames = {
  NIDORAN_F: 'Nidoran♀',
  NIDORAN_M: 'Nidoran♂',
  MR_MIME: 'Mr. Mime',
  FARFETCHD: "Farfetch'd",
};

const displayName = (species) =>
  specialNames[species] ?? species.charAt(0) + species.slice(1).toLowerCase();

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
          for (const map of maps) {
            addEncounter(slot[2], {
              method,
              path: locationFor(map),
              game: game.id,
              level: Number(slot[1]),
            });
          }
        }
      }
    }
  }

  for (const line of forGame(
    read(game.dir, 'data/wild/good_rod.asm'),
    game.define,
  )) {
    const slot = line.match(/^db\s+(\d+), (\w+)$/);

    if (slot)
      addEncounter(slot[2], {
        method: 'good-rod',
        path: null,
        game: game.id,
        level: Number(slot[1]),
      });
  }

  addEncounter('MAGIKARP', {
    method: 'old-rod',
    path: null,
    game: game.id,
    level: 5,
  });

  const superRod = read(game.dir, 'data/wild/super_rod.asm');

  if (superRod.includes('SuperRodFishingSlots')) {
    for (const [, map, slots] of superRod.matchAll(
      /db (\w+), ((?:\w+, \d+(?:, )?)+)$/gm,
    )) {
      for (const [, constant, level] of slots.matchAll(/(\w+), (\d+)/g)) {
        addEncounter(constant, {
          method: 'super-rod',
          path: locationFor(map),
          game: game.id,
          level: Number(level),
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
      for (const { level, constant } of groups.get(group)) {
        addEncounter(constant, {
          method: 'super-rod',
          path: locationFor(map),
          game: game.id,
          level,
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
    path: 'pallet-town',
    games: ['red', 'blue'],
    level: 5,
    source: 'scripts/OaksLab.asm',
  },
  {
    species: ['PIKACHU'],
    method: 'gift',
    path: 'pallet-town',
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

const mergeEncounters = (encounters) => {
  const merged = new Map();

  for (const { game, level, tradeFor, ...rest } of encounters) {
    const key = `${rest.method}|${rest.path}|${tradeFor ?? ''}`;
    const current = merged.get(key) ?? {
      ...rest,
      ...(tradeFor && { tradeFor: species.get(tradeFor).number }),
      games: [],
      levels: [],
    };

    if (!current.games.includes(game)) current.games.push(game);
    if (level !== undefined) current.levels.push(level);

    merged.set(key, current);
  }

  return [...merged.values()].map(({ levels, ...encounter }) => ({
    ...encounter,
    ...(levels.length > 0 && {
      levels: [Math.min(...levels), Math.max(...levels)],
    }),
  }));
};

const pokedex = [...species]
  .map(([constant, entry]) => {
    const evolvesFrom = preEvolution.get(constant);

    return {
      number: entry.number,
      name: entry.name,
      types: entry.types,
      games: games
        .map(({ id }) => id)
        .filter((id) => obtainable[id].has(constant)),
      ...(evolvesFrom && {
        evolvesFrom: {
          number: species.get(evolvesFrom.from).number,
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
