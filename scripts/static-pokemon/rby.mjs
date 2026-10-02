import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import {
  constantFromFile,
  facings,
  floorFor,
  forGame,
  games,
  hasOwnMapImage,
  pokeredDir,
  read,
  siteLocation,
  spritePath,
} from '../rby/disassembly.mjs';

const OUTPUT = new URL(
  '../../src/data/static-pokemon/rby.json',
  import.meta.url,
);

const NOT_CATCHABLE = [
  { map: 'ViridianCity' },
  { map: 'PalletTown', games: ['yellow'] },
];

const scripted = [
  {
    map: 'Route12',
    text: 'ROUTE12_SNORLAX',
    kind: 'static',
    species: ['SNORLAX'],
  },
  {
    map: 'Route16',
    text: 'ROUTE16_SNORLAX',
    kind: 'static',
    species: ['SNORLAX'],
  },
  {
    map: 'CeladonMansionRoofHouse',
    text: 'CELADONMANSION_ROOF_HOUSE_EEVEE_POKEBALL',
    kind: 'gift',
    species: ['EEVEE'],
  },
  {
    map: 'FightingDojo',
    text: 'FIGHTINGDOJO_HITMONLEE_POKE_BALL',
    kind: 'gift',
    species: ['HITMONLEE'],
    level: 30,
  },
  {
    map: 'FightingDojo',
    text: 'FIGHTINGDOJO_HITMONCHAN_POKE_BALL',
    kind: 'gift',
    species: ['HITMONCHAN'],
    level: 30,
  },
  {
    map: 'MtMoonPokecenter',
    text: 'MTMOONPOKECENTER_MAGIKARP_SALESMAN',
    kind: 'gift',
    species: ['MAGIKARP'],
  },
  {
    map: 'SilphCo7F',
    text: 'SILPHCO7F_SILPH_WORKER_M1',
    kind: 'gift',
    species: ['LAPRAS'],
  },
  {
    map: 'CinnabarLabFossilRoom',
    text: 'CINNABARLABFOSSILROOM_SCIENTIST1',
    kind: 'gift',
    species: ['OMANYTE', 'KABUTO', 'AERODACTYL'],
    level: 30,
  },
  {
    map: 'CeruleanMelaniesHouse',
    text: 'CERULEANMELANIESHOUSE_BULBASAUR',
    kind: 'gift',
    species: ['BULBASAUR'],
    games: ['yellow'],
  },
  {
    map: 'Route24',
    text: 'ROUTE24_COOLTRAINER_M4',
    kind: 'gift',
    species: ['CHARMANDER'],
    games: ['yellow'],
  },
  {
    map: 'VermilionCity',
    text: 'VERMILIONCITY_OFFICER_JENNY',
    kind: 'gift',
    species: ['SQUIRTLE'],
    games: ['yellow'],
  },
];

const triggered = [
  {
    map: 'PokemonTower6F',
    coords: 'PokemonTower6FMarowakCoords',
    species: ['RESTLESS_SOUL'],
    sprite: 'GHOST',
    note: "Ghost, can't be caught. Needs the Silph Scope",
  },
];

const speciesAliases = { RESTLESS_SOUL: 'MAROWAK' };

const STARTERS = {
  map: 'OaksLab',
  path: 'pallet-town/oaks-lab',
  games: ['red', 'blue'],
  level: 5,
  note: 'Starter, choose one',
  balls: [
    ['OAKSLAB_CHARMANDER_POKE_BALL', 'CHARMANDER'],
    ['OAKSLAB_SQUIRTLE_POKE_BALL', 'SQUIRTLE'],
    ['OAKSLAB_BULBASAUR_POKE_BALL', 'BULBASAUR'],
  ],
};

const dexNumbers = new Map(
  [
    ...read(pokeredDir, 'constants/pokedex_constants.asm').matchAll(
      /const DEX_(\w+)\s*; (\d+)/g,
    ),
  ].map(([, constant, number]) => [constant, Number(number)]),
);

const numberOf = (species) => {
  const number = dexNumbers.get(speciesAliases[species] ?? species);

  if (!number) throw new Error(`Unknown species ${species}`);

  return number;
};

const mapScripts = (game, map) =>
  readdirSync(join(game.dir, 'scripts'))
    .filter((file) => new RegExp(`^${map}(_\\d+)?\\.asm$`).test(file))
    .map((file) => read(game.dir, `scripts/${file}`))
    .join('\n');

const scriptedLevel = (game, { map, species, level }) => {
  const text = mapScripts(game, map);
  const [first] = species;
  const given = text.match(new RegExp(`lb bc, ${first}, (\\d+)`));
  const battled = text.match(
    new RegExp(
      `ld a, ${first}\\n\\s*ld \\[wCurOpponent\\], a\\n\\s*ld a, (\\d+)\\n\\s*ld \\[wCurEnemyLevel\\], a`,
    ),
  );
  const found = given?.[1] ?? battled?.[1];

  if (found) return Number(found);
  if (level && text.includes(`ld c, ${level}`)) return level;

  throw new Error(`${game.id}: no level for ${first} in ${map}`);
};

const checkScriptedList = (game) => {
  const sources = new Set(
    readdirSync(join(game.dir, 'scripts'))
      .filter((file) => {
        const text = read(game.dir, `scripts/${file}`);

        return (
          text.includes('call GivePokemon') ||
          /ld a, (?!OPP_)[A-Z_]+\n\s*ld \[wCurOpponent\], a/.test(text)
        );
      })
      .map((file) => basename(file, '.asm').replace(/_\d+$/, '')),
  );
  const listed = new Set(
    [...NOT_CATCHABLE, ...scripted, ...triggered]
      .filter((entry) => !entry.games || entry.games.includes(game.id))
      .map((entry) => entry.map),
  );
  const missing = [...sources].filter((map) => !listed.has(map));
  const stale = [...listed].filter((map) => !sources.has(map));

  if (missing.length > 0 || stale.length > 0)
    throw new Error(
      `${game.id}: unlisted Pokémon scripts [${missing}], listed without a script [${stale}]`,
    );
};

const placed = [];

const place = (game, map, x, y, kind, pokemon, extra = {}) => {
  const constant = constantFromFile(map);
  const { path = siteLocation(constant), ...details } = extra;
  const floor = floorFor(constant);

  if (!path || !hasOwnMapImage(game.dir, constant, path, floor)) return;

  placed.push({
    game: game.id,
    path,
    ...(floor && { floor }),
    x: Number(x),
    y: Number(y),
    kind,
    pokemon,
    ...details,
  });
};

const objectSprite = (game, sprite, direction) => ({
  sprite: spritePath(game, sprite),
  facing: facings[direction] ?? 'down',
});

const objectAt = (game, map, text) => {
  const object = read(game.dir, `data/maps/objects/${map}.asm`).match(
    new RegExp(
      `object_event\\s+(\\d+),\\s*(\\d+),\\s*SPRITE_(\\w+),\\s*\\w+,\\s*(\\w+),\\s*TEXT_${text}\\b`,
    ),
  );

  if (!object) throw new Error(`${game.id}: no object TEXT_${text} in ${map}`);

  return object;
};

for (const game of games) {
  checkScriptedList(game);

  for (const fileName of readdirSync(join(game.dir, 'data/maps/objects'))) {
    const map = basename(fileName, '.asm');
    const text = forGame(
      read(game.dir, `data/maps/objects/${fileName}`),
      game.define,
    ).join('\n');

    for (const [, x, y, sprite, direction, species, level] of text.matchAll(
      /^object_event\s+(\d+),\s*(\d+),\s*SPRITE_(\w+),\s*\w+,\s*(\w+),\s*TEXT_\w+, ([A-Z][A-Z_]+), (\d+)$/gm,
    )) {
      if (dexNumbers.has(species))
        place(
          game,
          map,
          x,
          y,
          'static',
          [{ number: numberOf(species), level: Number(level) }],
          objectSprite(game, sprite, direction),
        );
    }
  }

  for (const entry of scripted) {
    if (entry.games && !entry.games.includes(game.id)) continue;

    const objects = join(game.dir, `data/maps/objects/${entry.map}.asm`);

    if (!existsSync(objects))
      throw new Error(`${game.id}: missing objects for ${entry.map}`);

    const [, x, y, sprite, direction] = objectAt(game, entry.map, entry.text);
    const level = scriptedLevel(game, entry);

    place(
      game,
      entry.map,
      x,
      y,
      entry.kind,
      entry.species.map((species) => ({ number: numberOf(species), level })),
      entry.kind === 'static' ? objectSprite(game, sprite, direction) : {},
    );
  }
}

const coordsAt = (game, { map, coords }) => {
  const found = mapScripts(game, map).match(
    new RegExp(`${coords}:\\n\\s*dbmapcoord\\s+(\\d+),\\s*(\\d+)`),
  );

  if (!found) throw new Error(`${game.id}: no ${coords} in ${map}`);

  return found.slice(1);
};

for (const game of games) {
  for (const entry of triggered) {
    const [x, y] = coordsAt(game, entry);
    const level = scriptedLevel(game, entry);

    place(
      game,
      entry.map,
      x,
      y,
      'static',
      entry.species.map((species) => ({ number: numberOf(species), level })),
      { sprite: spritePath(game, entry.sprite), note: entry.note },
    );
  }
}

for (const game of games) {
  if (!STARTERS.games.includes(game.id)) continue;

  const { map, path, level, note, balls } = STARTERS;

  for (const [text, species] of balls) {
    const [, x, y] = objectAt(game, map, text);

    place(game, map, x, y, 'gift', [{ number: numberOf(species), level }], {
      path,
      sprite: 'poke_ball',
      note,
    });
  }
}

const merged = new Map();

for (const { game, ...pokemon } of placed) {
  const key = JSON.stringify(pokemon);
  const current = merged.get(key) ?? { ...pokemon, games: [] };

  current.games.push(game);
  merged.set(key, current);
}

const output = [...merged.values()];

writeFileSync(OUTPUT, `${JSON.stringify(output, null, 2)}\n`);

console.log(
  `Wrote ${output.length} static Pokémon to ${OUTPUT.pathname}\n${output
    .map(
      ({ path, floor, kind, pokemon, games: ids }) =>
        `${[path, floor].filter(Boolean).join(' ')} ${kind} ${pokemon.map(({ number, level }) => `#${number}@${level}`).join('/')} (${ids.join(',')})`,
    )
    .join('\n')}`,
);
