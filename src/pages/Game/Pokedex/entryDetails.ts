import { type Game, gamesSharingMap } from '@/data/games';
import { getLocation, type Region } from '@/data/maps';
import type { Encounter, PokedexEntry } from '@/data/pokedex/types';
import { formatList } from '@/lib/utils';

import { alphaLabel, evolutionLabel, levelLabel, methodLabel } from './format';

export const isObtainable = (entry: PokedexEntry, game: Game) =>
  entry.games.includes(game.id);

export const gamesWithEntry = (entry: PokedexEntry, game: Game) =>
  gamesSharingMap(game).filter((other) => entry.games.includes(other.id));

export const encountersIn = (entry: PokedexEntry, game: Game) =>
  entry.encounters.filter((encounter) => encounter.games.includes(game.id));

export const encounterPaths = (encounters: Array<Encounter>) =>
  encounters.flatMap((encounter) => (encounter.path ? [encounter.path] : []));

export const placeName = (region: Region, path: string) =>
  getLocation(region, path)?.name ?? path;

export const placesMapLabel = (
  entry: PokedexEntry,
  game: Game,
  region: Region,
  paths: Array<string>,
) =>
  `${region.name} Town Map highlighting where to find ${entry.name} in ${game.shortName}: ${formatList(
    [...new Set(paths)].map((path) => placeName(region, path)),
  )}`;

export const encounterSummary = (
  encounter: Encounter,
  nameOf: (number: number) => string,
) =>
  [
    encounter.tradeFor
      ? `${methodLabel(encounter)} for ${nameOf(encounter.tradeFor)}`
      : methodLabel(encounter),
    levelLabel(encounter),
  ]
    .filter(Boolean)
    .join(' · ');

export type EncounterLines = { lines: Array<string>; note?: string };

export const encounterLines = (
  encounter: Encounter,
  nameOf: (number: number) => string,
): EncounterLines => ({
  lines: [
    ...(encounter.levels || !encounter.alpha
      ? [encounterSummary(encounter, nameOf)]
      : []),
    ...(encounter.alpha ? [alphaLabel(encounter, true) ?? ''] : []),
  ],
  note: encounter.note,
});

export const evolutionSummary = (
  entry: PokedexEntry,
  nameOf: (number: number) => string,
) =>
  entry.evolvesFrom &&
  `Evolve ${nameOf(entry.evolvesFrom.number)} ${evolutionLabel(entry.evolvesFrom)}`;

export const tradeOnlyNote = (entry: PokedexEntry, game: Game) =>
  `Only obtainable in ${game.fullName} by trading from ${formatList(
    gamesWithEntry(entry, game).map((other) => other.fullName),
  )}.`;
