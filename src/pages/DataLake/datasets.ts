import { getGame } from '@/data/games';
import { itemsFor } from '@/data/items';
import {
  getLocationTrail,
  type Location,
  type Region,
  regions,
} from '@/data/maps';
import { npcsFor } from '@/data/npcs';
import { pokedexFor } from '@/data/pokedex';
import { getSpecies } from '@/data/pokedex/master';
import { signsFor } from '@/data/signs';
import { staticPokemonFor } from '@/data/static-pokemon';
import { trainersFor } from '@/data/trainers';

import type { Column, Row } from './table';
import { VERSION_GROUPS } from './versionGroups';

export type Dataset = {
  id: string;
  label: string;
  blurb: string;
  columns: Array<Column>;
  rows: () => Array<Row>;
};

const pokemonName = (number: number) =>
  getSpecies(number)?.name ?? `#${number}`;

const gameNames = (games: Array<string>) =>
  games.map((id) => getGame(id)?.shortName ?? id);

const regionOf = (versionGroup: string) =>
  regions.find((region) => region.versionGroup === versionGroup);

const placeName = (
  versionGroup: string,
  path: string | null | undefined,
  floor?: string,
) => {
  if (!path) return undefined;

  const region = regionOf(versionGroup);
  const trail = region && getLocationTrail(region, path);
  const name = trail
    ? trail.map((location) => location.name).join(' › ')
    : path;

  return floor ? `${name} (${floor.toUpperCase()})` : name;
};

const forEachGroup = <T>(
  source: (versionGroup: string) => Array<T> | undefined,
  build: (item: T, versionGroup: string, label: string) => Array<Row>,
) =>
  VERSION_GROUPS.flatMap(([versionGroup, label]) =>
    (source(versionGroup) ?? []).flatMap((item) =>
      build(item, versionGroup, label),
    ),
  );

const spread = (values: Array<number>) =>
  values.length === 0
    ? { min: undefined, max: undefined }
    : { min: Math.min(...values), max: Math.max(...values) };

const gameColumn: Column = { id: 'game', label: 'Game', kind: 'category' };
const gamesColumn: Column = {
  id: 'games',
  label: 'Versions',
  kind: 'category',
};

const collectLocations = (
  locations: Array<Location>,
  parent?: Location,
): Array<{ location: Location; parent?: Location }> =>
  locations.flatMap((location) => [
    { location, parent },
    ...collectLocations(location.locations, location),
  ]);

const regionRows = (region: Region, label: string): Array<Row> =>
  collectLocations(region.locations).map(({ location, parent }) => ({
    game: label,
    name: location.name,
    kind: location.kind,
    inside: parent?.name,
    floors: location.floors?.length ?? 1,
    places: location.locations.length,
    exits: location.hotspots.length,
    markers: location.markers.length,
    versions: location.games ? gameNames(location.games) : 'All',
  }));

const levelOf = ({ level }: { level: number }) => level;

export const datasets: Array<Dataset> = [
  {
    id: 'pokemon',
    label: 'Pokémon',
    blurb: 'Every Pokédex entry, with its types and where it can be found.',
    columns: [
      gameColumn,
      { id: 'dex', label: 'Dex #', kind: 'number' },
      { id: 'name', label: 'Name', kind: 'text' },
      { id: 'types', label: 'Type', kind: 'category' },
      { id: 'typeCount', label: 'Type count', kind: 'number' },
      gamesColumn,
      { id: 'encounters', label: 'Encounters', kind: 'number' },
      { id: 'evolvesFrom', label: 'Evolves from', kind: 'category' },
      { id: 'megas', label: 'Megas', kind: 'number' },
    ],
    rows: () =>
      forEachGroup(pokedexFor, (entry, _group, label) => [
        {
          game: label,
          dex: entry.id,
          name: entry.name,
          types: entry.types.map(
            (type) => type.charAt(0).toUpperCase() + type.slice(1),
          ),
          typeCount: entry.types.length,
          games: gameNames(entry.games),
          encounters: entry.encounters.length,
          evolvesFrom: entry.evolvesFrom
            ? pokemonName(entry.evolvesFrom.number)
            : undefined,
          megas: entry.megas?.length ?? 0,
        },
      ]),
  },
  {
    id: 'encounters',
    label: 'Encounters',
    blurb: 'Every way to get a Pokémon: wild, fishing, gifts, trades and more.',
    columns: [
      gameColumn,
      { id: 'pokemon', label: 'Pokémon', kind: 'category' },
      { id: 'method', label: 'Method', kind: 'category' },
      { id: 'place', label: 'Place', kind: 'category' },
      { id: 'minLevel', label: 'Min level', kind: 'number' },
      { id: 'maxLevel', label: 'Max level', kind: 'number' },
      { id: 'chance', label: 'Chance %', kind: 'number' },
      { id: 'alpha', label: 'Alpha %', kind: 'number' },
      gamesColumn,
      { id: 'note', label: 'Note', kind: 'text', hidden: true },
    ],
    rows: () =>
      forEachGroup(pokedexFor, (entry, group, label) =>
        entry.encounters.map((encounter) => ({
          game: label,
          pokemon: entry.name,
          method: encounter.method,
          place: placeName(group, encounter.path) ?? encounter.place,
          minLevel: encounter.levels?.[0],
          maxLevel: encounter.levels?.[1],
          chance: encounter.chance
            ? Math.round(encounter.chance[1])
            : undefined,
          alpha: encounter.alpha?.chance,
          games: gameNames(encounter.games),
          note: encounter.note,
        })),
      ),
  },
  {
    id: 'trainers',
    label: 'Trainers',
    blurb: 'Every trainer battle, with the size and strength of their teams.',
    columns: [
      gameColumn,
      { id: 'name', label: 'Trainer', kind: 'text' },
      { id: 'class', label: 'Class', kind: 'category' },
      { id: 'place', label: 'Place', kind: 'category' },
      { id: 'parties', label: 'Teams', kind: 'number' },
      { id: 'teamSize', label: 'Biggest team', kind: 'number' },
      { id: 'lowest', label: 'Lowest level', kind: 'number' },
      { id: 'highest', label: 'Highest level', kind: 'number' },
      gamesColumn,
      { id: 'pokemon', label: 'Pokémon', kind: 'category', hidden: true },
    ],
    rows: () =>
      forEachGroup(trainersFor, (battle, group, label) => {
        const team = battle.parties.flatMap((party) => party.pokemon);
        const levels = spread(team.map(levelOf));

        return [
          {
            game: label,
            name: battle.name,
            class: battle.trainerClass,
            place: placeName(group, battle.path, battle.floor),
            parties: battle.parties.length,
            teamSize: Math.max(
              0,
              ...battle.parties.map((party) => party.pokemon.length),
            ),
            lowest: levels.min,
            highest: levels.max,
            games: gameNames(battle.games),
            pokemon: [
              ...new Set(team.map(({ number }) => pokemonName(number))),
            ],
          },
        ];
      }),
  },
  {
    id: 'trainer-pokemon',
    label: 'Trainer teams',
    blurb: 'Every Pokémon on every trainer team, one row each, with its moves.',
    columns: [
      gameColumn,
      { id: 'trainer', label: 'Trainer', kind: 'text' },
      { id: 'class', label: 'Class', kind: 'category' },
      { id: 'place', label: 'Place', kind: 'category' },
      { id: 'pokemon', label: 'Pokémon', kind: 'category' },
      { id: 'level', label: 'Level', kind: 'number' },
      { id: 'moves', label: 'Moves', kind: 'category' },
      gamesColumn,
    ],
    rows: () =>
      forEachGroup(trainersFor, (battle, group, label) =>
        battle.parties.flatMap((party) =>
          party.pokemon.map((member) => ({
            game: label,
            trainer: battle.name,
            class: battle.trainerClass,
            place: placeName(group, battle.path, battle.floor),
            pokemon: pokemonName(member.number),
            level: member.level,
            moves: member.moves,
            games: gameNames(battle.games),
          })),
        ),
      ),
  },
  {
    id: 'items',
    label: 'Items',
    blurb: 'Every item lying on the ground or hidden somewhere.',
    columns: [
      gameColumn,
      { id: 'item', label: 'Item', kind: 'category' },
      { id: 'place', label: 'Place', kind: 'category' },
      { id: 'hidden', label: 'Visibility', kind: 'category' },
      gamesColumn,
      { id: 'note', label: 'Note', kind: 'text', hidden: true },
    ],
    rows: () =>
      forEachGroup(itemsFor, (item, group, label) => [
        {
          game: label,
          item: item.item,
          place: placeName(group, item.path, item.floor),
          hidden: item.hidden ? 'Hidden' : 'Visible',
          games: gameNames(item.games),
          note: item.note,
        },
      ]),
  },
  {
    id: 'people',
    label: 'People',
    blurb: 'Every talking person on the maps, and what they say.',
    columns: [
      gameColumn,
      { id: 'name', label: 'Name', kind: 'category' },
      { id: 'place', label: 'Place', kind: 'category' },
      { id: 'lines', label: 'Lines', kind: 'number' },
      { id: 'gives', label: 'Gives', kind: 'category' },
      { id: 'trades', label: 'Trades', kind: 'text' },
      { id: 'dialogue', label: 'Dialogue', kind: 'text' },
      gamesColumn,
    ],
    rows: () =>
      forEachGroup(npcsFor, (npc, group, label) => [
        {
          game: label,
          name: npc.name,
          place: placeName(group, npc.path, npc.floor),
          lines: npc.dialog.length,
          gives: npc.dialog.flatMap(({ gift }) => (gift ? [gift.name] : [])),
          trades: npc.dialog
            .flatMap(({ trade }) =>
              trade ? [`${trade.give.name} for ${trade.receive.name}`] : [],
            )
            .join('; '),
          dialogue: npc.dialog.map(({ text }) => text).join(' / '),
          games: gameNames(npc.games),
        },
      ]),
  },
  {
    id: 'signs',
    label: 'Signs',
    blurb: 'Every sign, board and poster you can read.',
    columns: [
      gameColumn,
      { id: 'place', label: 'Place', kind: 'category' },
      { id: 'text', label: 'Text', kind: 'text' },
      { id: 'prizes', label: 'Prizes', kind: 'number' },
      gamesColumn,
    ],
    rows: () =>
      forEachGroup(signsFor, (sign, group, label) => [
        {
          game: label,
          place: placeName(group, sign.path, sign.floor),
          text: sign.text,
          prizes: sign.prizes?.length ?? 0,
          games: gameNames(sign.games),
        },
      ]),
  },
  {
    id: 'static',
    label: 'Gifts and statics',
    blurb: 'Pokémon you can only get once: gifts, legendaries and sleepers.',
    columns: [
      gameColumn,
      { id: 'kind', label: 'Kind', kind: 'category' },
      { id: 'pokemon', label: 'Pokémon', kind: 'category' },
      { id: 'place', label: 'Place', kind: 'category' },
      { id: 'level', label: 'Level', kind: 'number' },
      gamesColumn,
      { id: 'note', label: 'Note', kind: 'text', hidden: true },
    ],
    rows: () =>
      forEachGroup(staticPokemonFor, (entry, group, label) =>
        entry.pokemon.map((choice) => ({
          game: label,
          kind: entry.kind === 'gift' ? 'Gift' : 'Static',
          pokemon: pokemonName(choice.number),
          place: placeName(group, entry.path, entry.floor),
          level: choice.level,
          games: gameNames(entry.games),
          note: entry.note,
        })),
      ),
  },
  {
    id: 'places',
    label: 'Places',
    blurb: 'Every town, route, cave and building on the maps.',
    columns: [
      gameColumn,
      { id: 'name', label: 'Name', kind: 'text' },
      { id: 'kind', label: 'Kind', kind: 'category' },
      { id: 'inside', label: 'Inside', kind: 'category' },
      { id: 'floors', label: 'Floors', kind: 'number' },
      { id: 'places', label: 'Places inside', kind: 'number' },
      { id: 'exits', label: 'Hotspots', kind: 'number' },
      { id: 'markers', label: 'Markers', kind: 'number' },
      { id: 'versions', label: 'Versions', kind: 'category' },
    ],
    rows: () =>
      regions.flatMap((region) => {
        const label =
          VERSION_GROUPS.find(([id]) => id === region.versionGroup)?.[1] ??
          region.name;

        return regionRows(region, label);
      }),
  },
];

const cache = new Map<string, Array<Row>>();

export const rowsOf = (dataset: Dataset) => {
  const cached = cache.get(dataset.id);

  if (cached) return cached;

  const rows = dataset.rows();

  cache.set(dataset.id, rows);

  return rows;
};
