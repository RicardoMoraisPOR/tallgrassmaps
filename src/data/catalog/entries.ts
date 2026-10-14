import { getRegion } from '../maps';
import type { CatalogEntry, Generation } from './types';

export const entryName = (entry: CatalogEntry) =>
  entry.status === 'coming-soon' ? entry.title : entry.fullName;

const regionOf = (id: string) => {
  const region = getRegion(id);

  return region?.partOf ?? region?.name ?? id;
};

export const entryRegions = (entry: CatalogEntry): Array<string> =>
  entry.status === 'coming-soon' ? entry.regions : [regionOf(entry.region)];

export const entryRegionLabels = (entry: CatalogEntry): Array<string> => {
  if (entry.status === 'coming-soon') return entry.regions;

  const region = getRegion(entry.region);

  return [
    region?.partOf
      ? `${region.partOf} (${region.name})`
      : regionOf(entry.region),
  ];
};

export const entryVersionGroup = (entry: CatalogEntry) =>
  entry.status === 'coming-soon'
    ? entry.versionGroup
    : getRegion(entry.region)?.versionGroup;

export const generationRegions = (generation: Generation) => [
  ...new Set(generation.entries.flatMap(entryRegions)),
];
