import { regionIdsOf } from '../games';
import { getRegion } from '../maps';
import { generations } from './generations';
import { remakesOf } from './remakes';
import type { CatalogEntry, Generation, UpcomingGame } from './types';

export const entryName = (entry: CatalogEntry) =>
  entry.status === 'coming-soon' ? entry.title : entry.fullName;

const regionOf = (id: string) => {
  const region = getRegion(id);

  return region?.partOf ?? region?.name ?? id;
};

export const entryRegions = (entry: CatalogEntry): Array<string> =>
  entry.status === 'coming-soon'
    ? entry.regions
    : [...new Set(regionIdsOf(entry).map(regionOf))];

export const entryRegionLabels = (entry: CatalogEntry): Array<string> => {
  if (entry.status === 'coming-soon') return entry.regions;

  return regionIdsOf(entry).map((id) => {
    const region = getRegion(id);

    return region?.partOf ? `${region.partOf} (${region.name})` : regionOf(id);
  });
};

export const entryVersionGroup = (entry: CatalogEntry) =>
  entry.status === 'coming-soon'
    ? entry.versionGroup
    : getRegion(entry.region)?.versionGroup;

export const generationRegions = (generation: Generation) => [
  ...new Set(generation.entries.flatMap(entryRegions)),
];

export const getUpcomingGame = (id: string | undefined) =>
  generations
    .flatMap(({ entries }) => entries)
    .find(
      (entry): entry is UpcomingGame =>
        entry.status === 'coming-soon' && entry.id === id,
    );

export const generationOf = (id: string) =>
  generations.find(({ entries }) => entries.some((entry) => entry.id === id));

export const entryShortName = (entry: CatalogEntry) =>
  entry.status === 'coming-soon'
    ? entry.title.replace(/^Pokémon /, '')
    : entry.shortName;

export const entriesSharingMap = (entry: CatalogEntry) =>
  generations
    .flatMap(({ entries }) => entries)
    .filter((other) => entryVersionGroup(other) === entryVersionGroup(entry));

const allEntries = () => generations.flatMap(({ entries }) => entries);

const entriesById = (ids: Array<string>) =>
  allEntries().filter((entry) => ids.includes(entry.id));

export const entryRemakes = (entry: CatalogEntry) =>
  entriesById(remakesOf[entry.id] ?? []);

export const entryOriginals = (entry: CatalogEntry) =>
  entriesById(
    Object.entries(remakesOf).flatMap(([id, remakes]) =>
      remakes.includes(entry.id) ? [id] : [],
    ),
  );
