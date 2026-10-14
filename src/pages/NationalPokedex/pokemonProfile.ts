import { type Game, games, getGame } from '@/data/games';
import { getLocation, getRegion, type Region } from '@/data/maps';
import { pokedexFor } from '@/data/pokedex';
import { getSpecies, species } from '@/data/pokedex/master';
import type {
  Encounter,
  EncounterMethod,
  Evolution,
  Species,
} from '@/data/pokedex/types';
import {
  gameSprite,
  megaSprite,
  pokeapiSprite,
  zaFormSprite,
} from '@/data/sprites';
import { staticPokemonFor } from '@/data/static-pokemon';
import { locationHref } from '@/lib/paths';

import { encounterHighlightKey } from '../Game/Location/encounters';
import { placeName } from '../Game/Pokedex/entryDetails';
import {
  alphaLabel,
  chanceLabel,
  levelLabel,
  methodLabel,
} from '../Game/Pokedex/format';

export const generations = [
  { id: 1, label: 'Generation I', last: 151 },
  { id: 2, label: 'Generation II', last: 251 },
  { id: 3, label: 'Generation III', last: 386 },
  { id: 4, label: 'Generation IV', last: 493 },
  { id: 5, label: 'Generation V', last: 649 },
  { id: 6, label: 'Generation VI', last: 721 },
  { id: 7, label: 'Generation VII', last: 809 },
  { id: 8, label: 'Generation VIII', last: 905 },
  { id: 9, label: 'Generation IX', last: 1025 },
];

export const generationOf = (number: number) =>
  generations.find(({ last }) => number <= last) ?? generations.at(-1)!;

export const allTypes = [
  ...new Set(
    species.flatMap(({ types, regionalForms }) => [
      ...types,
      ...(regionalForms ?? []).flatMap((form) => form.types),
    ]),
  ),
].sort();

export const hasType = (family: Species, type: string) =>
  family.types.includes(type) ||
  (family.regionalForms ?? []).some((form) => form.types.includes(type));

export const nameOf = (number: number) =>
  getSpecies(number)?.name ?? `#${number}`;

export type Appearance = {
  region: Region;
  games: Array<Game>;
};

const mappedGames = games.flatMap((game) => {
  const region = getRegion(game.region);
  const entries = region && pokedexFor(region.versionGroup);

  return region && entries ? [{ game, region, entries }] : [];
});

export const mappedGameNames = mappedGames.map(({ game }) => game.shortName);

const entriesFor = (number: number, game: Game) =>
  mappedGames
    .find((mapped) => mapped.game.id === game.id)
    ?.entries.filter(
      (entry) => entry.number === number && entry.games.includes(game.id),
    ) ?? [];

export const appearancesOf = (number: number): Array<Appearance> => {
  const byRegion = new Map<string, Appearance>();

  for (const { game, region } of mappedGames) {
    if (entriesFor(number, game).length === 0) continue;

    const existing = byRegion.get(region.id);

    if (existing) existing.games.push(game);
    else byRegion.set(region.id, { region, games: [game] });
  }

  return [...byRegion.values()];
};

export type MethodGroup =
  | 'Wild'
  | 'Surfing'
  | 'Fishing'
  | 'Gift'
  | 'Static'
  | 'Trade'
  | 'Other';

export const methodGroups: Array<MethodGroup> = [
  'Wild',
  'Surfing',
  'Fishing',
  'Gift',
  'Static',
  'Trade',
  'Other',
];

const methodGroupByMethod: Record<EncounterMethod, MethodGroup> = {
  walk: 'Wild',
  surf: 'Surfing',
  'old-rod': 'Fishing',
  'good-rod': 'Fishing',
  'super-rod': 'Fishing',
  gift: 'Gift',
  static: 'Static',
  trade: 'Trade',
  fossil: 'Other',
  'fossil-item': 'Other',
  prize: 'Other',
  battle: 'Other',
  hyperspace: 'Other',
};

export type SpotLink = {
  to: string;
  state?: { focusKey: string };
};

export type Spot = {
  key: string;
  label: string;
  regionName: string;
  link?: SpotLink;
  floorLabel?: string;
  games: Array<Game>;
  regionGames: number;
  group: MethodGroup;
  lines: Array<string>;
  form?: string;
};

const spotLines = (encounter: Encounter, floorLabel?: string) => {
  const method = encounter.tradeFor
    ? `${methodLabel(encounter)} for ${nameOf(encounter.tradeFor)}`
    : methodLabel(encounter);
  const summary = [
    floorLabel,
    method,
    levelLabel(encounter),
    chanceLabel(encounter),
  ]
    .filter(Boolean)
    .join(' · ');
  const alpha = alphaLabel(encounter, true);

  return [
    ...(encounter.levels || !encounter.alpha ? [summary] : []),
    ...(alpha ? [alpha] : []),
    ...(encounter.note ? [encounter.note] : []),
  ];
};

const staticFloor = (region: Region, number: number, encounter: Encounter) =>
  staticPokemonFor(region.versionGroup)?.find(
    (marker) =>
      marker.path === encounter.path &&
      marker.pokemon.some((choice) => choice.number === number) &&
      marker.games.some((id) => encounter.games.includes(id)),
  )?.floor;

export const spotsOf = (number: number): Array<Spot> =>
  appearancesOf(number).flatMap(({ region, games: regionGames }) =>
    (pokedexFor(region.versionGroup) ?? [])
      .filter(
        (entry) =>
          entry.number === number &&
          entry.games.some((id) => regionGames.some((game) => game.id === id)),
      )
      .flatMap((entry) =>
        entry.encounters.flatMap((encounter) => {
          const encounterGames = encounter.games.flatMap((id) => {
            const game = getGame(id);

            return game ? [game] : [];
          });

          if (encounterGames.length === 0) return [];

          const { path } = encounter;
          const location = path ? getLocation(region, path) : undefined;
          const focusKey = encounterHighlightKey({ entry, encounter });
          const linkTo = (floor?: string): SpotLink | undefined =>
            path
              ? {
                  to: `${locationHref(encounterGames[0].id, path)}${floor ? `?floor=${encodeURIComponent(floor)}` : ''}`,
                  state: focusKey ? { focusKey } : undefined,
                }
              : undefined;
          const base = {
            key: `${region.id}|${path ?? ''}|${encounter.place ?? ''}`,
            label: path
              ? placeName(region, path)
              : (encounter.place ?? 'Any water'),
            regionName: region.name,
            games: encounterGames,
            regionGames: regionGames.length,
            group: methodGroupByMethod[encounter.method],
            form: entry.form?.label,
          };

          if (encounter.floors && encounter.floors.length > 0) {
            return encounter.floors.map((floor) => {
              const floorLabel =
                location?.floors?.find(({ id }) => id === floor.floor)?.name ??
                floor.floor.toUpperCase();

              return {
                ...base,
                link: linkTo(floor.floor),
                floorLabel,
                lines: spotLines(
                  { ...encounter, levels: floor.levels, chance: floor.chance },
                  floorLabel,
                ),
              };
            });
          }

          return [
            {
              ...base,
              link: linkTo(staticFloor(region, number, encounter)),
              lines: spotLines(encounter),
            },
          ];
        }),
      ),
  );

export type SpotFilter = {
  game: string;
  group: string;
  query: string;
};

export const ALL = 'all';

export const filterSpots = (spots: Array<Spot>, filter: SpotFilter) => {
  const needle = filter.query.trim().toLowerCase();

  return spots.filter(
    (spot) =>
      (filter.game === ALL ||
        spot.games.some((game) => game.id === filter.game)) &&
      (filter.group === ALL || spot.group === filter.group) &&
      (!needle || spot.label.toLowerCase().includes(needle)),
  );
};

export type SpotPlace = {
  key: string;
  label: string;
  regionName: string;
  link?: SpotLink;
  spots: Array<Spot>;
};

export const placesOf = (spots: Array<Spot>) => {
  const places: Array<SpotPlace> = [];

  for (const spot of spots) {
    const place = places.find(({ key }) => key === spot.key);

    if (place) place.spots.push(spot);
    else
      places.push({
        key: spot.key,
        label: spot.label,
        regionName: spot.regionName,
        link: spot.link,
        spots: [spot],
      });
  }

  const regionOrder = [...new Set(places.map(({ regionName }) => regionName))];

  return places.sort(
    (a, b) =>
      regionOrder.indexOf(a.regionName) - regionOrder.indexOf(b.regionName) ||
      a.label.localeCompare(b.label, 'en', { numeric: true }),
  );
};

export type SpriteOption = {
  key: string;
  group: string;
  source: string;
  src: string;
  pixelArt: boolean;
  size: number;
};

const SHEET_SIZE = 96;
const GEN_ONE_SIZE = 56;

const displaySize = (src: string, pixelArt: boolean) => {
  if (!pixelArt || src.includes('/pokeapi/')) return SHEET_SIZE;

  return GEN_ONE_SIZE;
};

const renderGame = getGame('legends-za');

export const BASE_GROUP = 'Base';

export const spritesFor = (family: Species): Array<SpriteOption> => {
  const options: Array<SpriteOption> = [];
  const add = (
    group: string,
    source: string,
    src: string | undefined,
    pixelArt: boolean,
  ) => {
    if (!src) return;

    const existing = options.find((option) => option.src === src);

    if (existing) existing.source = `${existing.source} · ${source}`;
    else
      options.push({
        key: src,
        group,
        source,
        src,
        pixelArt,
        size: displaySize(src, pixelArt),
      });
  };

  add(BASE_GROUP, 'PokeAPI', pokeapiSprite(family.number), true);

  for (const { game } of mappedGames) {
    if (!game.sprites || entriesFor(family.number, game).length === 0) continue;

    add(
      BASE_GROUP,
      game.shortName,
      gameSprite(family.number, game),
      game.sprites.pixelated ?? true,
    );
  }

  const zaEntries = renderGame ? entriesFor(family.number, renderGame) : [];
  const zaMegas = zaEntries.flatMap((entry) => entry.megas ?? []);
  const zaName = renderGame?.shortName ?? '';

  for (const form of family.regionalForms ?? []) {
    if (form.spriteId)
      add(form.name, 'PokeAPI', pokeapiSprite(form.spriteId), true);

    add(form.name, zaName, zaFormSprite(form.spriteId), false);
  }

  for (const form of family.transformations ?? []) {
    if (form.spriteId)
      add(form.name, 'PokeAPI', pokeapiSprite(form.spriteId), true);

    if (zaMegas.some((mega) => mega.form === form.form)) {
      add(form.name, zaName, megaSprite(family.number, form.form), false);
    }
  }

  return options;
};

export const spriteGroups = (sprites: Array<SpriteOption>) => {
  const groups: Array<{ name: string; sprites: Array<SpriteOption> }> = [];

  for (const sprite of sprites) {
    const group = groups.find(({ name }) => name === sprite.group);

    if (group) group.sprites.push(sprite);
    else groups.push({ name: sprite.group, sprites: [sprite] });
  }

  return groups;
};

export type EvolutionNode = {
  number: number;
  evolution?: Evolution;
  children: Array<EvolutionNode>;
};

const evolvesFrom = new Map<number, Evolution>(
  species.flatMap((family) =>
    family.evolvesFrom ? [[family.number, family.evolvesFrom] as const] : [],
  ),
);

const evolvesInto = new Map<number, Array<number>>();

for (const [number, evolution] of evolvesFrom) {
  evolvesInto.set(evolution.number, [
    ...(evolvesInto.get(evolution.number) ?? []),
    number,
  ]);
}

export const evolutionParent = (number: number) =>
  evolvesFrom.get(number)?.number;

const nodeFor = (number: number, seen: Set<number>): EvolutionNode => {
  seen.add(number);

  return {
    number,
    evolution: evolvesFrom.get(number),
    children: (evolvesInto.get(number) ?? [])
      .filter((child) => !seen.has(child))
      .map((child) => nodeFor(child, seen)),
  };
};

export const evolutionTree = (number: number): EvolutionNode | undefined => {
  const climbed = new Set([number]);
  let root = number;
  let parent = evolvesFrom.get(root)?.number;

  while (parent !== undefined && !climbed.has(parent)) {
    root = parent;
    climbed.add(root);
    parent = evolvesFrom.get(root)?.number;
  }

  const tree = nodeFor(root, new Set());

  return tree.children.length > 0
    ? { ...tree, evolution: undefined }
    : undefined;
};

export type PokemonForm = {
  name: string;
  kind: 'Regional' | 'Mega';
  types?: Array<string>;
  spriteId?: number;
  stone?: string;
};

export const formsOf = (family: Species): Array<PokemonForm> => {
  const megas =
    pokedexFor('ZA')
      ?.filter((entry) => entry.number === family.number)
      .flatMap((entry) => entry.megas ?? []) ?? [];

  return [
    ...(family.regionalForms ?? []).map(({ name, types, spriteId }) => ({
      name,
      kind: 'Regional' as const,
      types,
      spriteId,
    })),
    ...(family.transformations ?? []).map(({ name, form, spriteId }) => {
      const mega = megas.find((candidate) => candidate.form === form);

      return {
        name,
        kind: 'Mega' as const,
        types: mega?.types,
        spriteId,
        stone: mega?.stone,
      };
    }),
  ];
};
