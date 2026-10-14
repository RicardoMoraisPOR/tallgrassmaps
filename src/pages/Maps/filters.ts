import { entryRegions, entryVersionGroup } from '@/data/catalog/entries';
import { generations } from '@/data/catalog/generations';
import type { CatalogEntry, Generation } from '@/data/catalog/types';
import {
  versionGroupNames,
  versionGroupParts,
} from '@/data/catalog/versionGroups';
import { type LabelPart, platformParts } from '@/data/games';
import { formatList, slugify } from '@/lib/utils';

export type MapsView = 'map' | 'generation';

export type FilterKey = 'region' | 'map' | 'console' | 'generation';

export type Filters = Record<FilterKey, Array<string>>;

export type FilterOption = {
  value: string;
  label: string;
  title?: string;
  parts?: Array<LabelPart>;
};

export type FilterGroup = {
  key: FilterKey;
  label: string;
  options: Array<FilterOption>;
};

const allEntries = generations.flatMap(({ entries }) => entries);

const generationOfEntry = new Map(
  generations.flatMap(({ number, entries }) =>
    entries.map((entry) => [entry.id, String(number)] as const),
  ),
);

const entryMaps = (entry: CatalogEntry) => {
  const versionGroup = entryVersionGroup(entry);

  return versionGroup ? [versionGroup] : [];
};

const toOptions = (labels: Array<string>): Array<FilterOption> =>
  [...new Set(labels)].map((label) => ({ value: slugify(label), label }));

export const filterGroups: Array<FilterGroup> = [
  {
    key: 'region',
    label: 'Region',
    options: toOptions(allEntries.flatMap(entryRegions)),
  },
  {
    key: 'console',
    label: 'Console',
    options: [...new Set(allEntries.map((entry) => entry.platform))].map(
      (platform) => ({
        value: slugify(platform),
        label: platform,
        parts: platformParts[platform],
      }),
    ),
  },
  {
    key: 'map',
    label: 'Map',
    options: toOptions(allEntries.flatMap(entryMaps)).map((option) => ({
      ...option,
      title: formatList(versionGroupNames(option.label)),
      parts: versionGroupParts(option.label),
    })),
  },
  {
    key: 'generation',
    label: 'Generation',
    options: generations.map(({ number, roman }) => ({
      value: String(number),
      label: `Generation ${roman}`,
    })),
  },
];

export const groupsFor = (view: MapsView) =>
  filterGroups.filter(({ key }) =>
    view === 'map' ? key !== 'map' : key !== 'generation',
  );

export const totalGames = allEntries.length;

const entryValues = (entry: CatalogEntry): Filters => ({
  region: entryRegions(entry).map(slugify),
  map: entryMaps(entry).map(slugify),
  console: [slugify(entry.platform)],
  generation: [generationOfEntry.get(entry.id) ?? ''],
});

const matches = (entry: CatalogEntry, filters: Filters) => {
  const values = entryValues(entry);

  return filterGroups.every(
    ({ key }) =>
      filters[key].length === 0 ||
      values[key].some((value) => filters[key].includes(value)),
  );
};

export const filterGenerations = (filters: Filters): Array<Generation> =>
  generations
    .map((generation) => ({
      ...generation,
      entries: generation.entries.filter((entry) => matches(entry, filters)),
    }))
    .filter(({ entries }) => entries.length > 0);

export type MapGroup = {
  versionGroup: string;
  entries: Array<CatalogEntry>;
};

export const groupByMap = (entries: Array<CatalogEntry>): Array<MapGroup> => {
  const groups = new Map<string, Array<CatalogEntry>>();

  for (const entry of entries) {
    const versionGroup = entryVersionGroup(entry) ?? entry.id;

    groups.set(versionGroup, [...(groups.get(versionGroup) ?? []), entry]);
  }

  return [...groups].map(([versionGroup, grouped]) => ({
    versionGroup,
    entries: grouped,
  }));
};
