import { getRegion } from '../maps';
import type { CatalogEntry, Generation } from './types';

export const entryName = (entry: CatalogEntry) =>
  entry.status === 'coming-soon' ? entry.title : entry.fullName;

export const entryRegions = (entry: CatalogEntry): Array<string> =>
  entry.status === 'coming-soon'
    ? entry.regions
    : [getRegion(entry.region)?.name ?? entry.region];

export const entryVersionGroup = (entry: CatalogEntry) =>
  entry.status === 'coming-soon'
    ? entry.versionGroup
    : getRegion(entry.region)?.versionGroup;

export const generationRegions = (generation: Generation) => [
  ...new Set(generation.entries.flatMap(entryRegions)),
];
