import type { MapItem } from '@/data/items/types';

import { normalize } from './placeSearch';

const rank = (name: string, search: string) => {
  if (name === search) return 0;
  if (name.startsWith(search)) return 1;
  if (name.split(/\s+/).some((word) => word.startsWith(search))) return 2;

  return 3;
};

export const searchItems = (items: Array<MapItem>, query: string) => {
  const search = normalize(query);

  if (!search) return items;

  const tokens = search.split(/\s+/);

  return items
    .map((item) => ({ item, name: normalize(item.item) }))
    .filter(({ name }) => tokens.every((token) => name.includes(token)))
    .toSorted((a, b) => rank(a.name, search) - rank(b.name, search))
    .map(({ item }) => item);
};
