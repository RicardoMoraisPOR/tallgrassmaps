import {
  type CatalogEntry,
  entryRegions,
  entryVersionGroup,
  type Generation,
  generations,
  versionGroupNames,
  versionGroupParts,
} from '@/data/catalog';
import { type LabelPart, platformParts } from '@/data/games';
import { formatList, slugify } from '@/lib/utils';

export type FilterKey = 'region' | 'map' | 'console';

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
    options: [...new Set(allEntries.map((entry) => entry.game.platform))].map(
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
];

export const totalGames = allEntries.length;

const entryValues = (entry: CatalogEntry): Filters => ({
  region: entryRegions(entry).map(slugify),
  map: entryMaps(entry).map(slugify),
  console: [slugify(entry.game.platform)],
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
