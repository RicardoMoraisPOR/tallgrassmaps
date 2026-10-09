import type { PokedexEntry } from '@/data/pokedex/types';

import { normalize } from './placeSearch';

const rank = (name: string, tokens: Array<string>) => {
  const search = tokens.join(' ');

  if (name === search) return 0;
  if (name.startsWith(search)) return 1;
  if (
    tokens.every((token) =>
      name.split(/\s+/).some((word) => word.startsWith(token)),
    )
  )
    return 2;

  return 3;
};

export const searchPokemon = (entries: Array<PokedexEntry>, query: string) => {
  const text = normalize(query).replace(/^#/, '');

  if (!text) return entries;

  if (/^\d+$/.test(text)) {
    const number = Number(text);

    return entries.filter(
      (entry) => entry.id === number || entry.number === number,
    );
  }

  const tokens = text.split(/\s+/);

  return entries
    .map((entry) => ({ entry, name: normalize(entry.name) }))
    .filter(({ name }) => tokens.every((token) => name.includes(token)))
    .toSorted((a, b) => rank(a.name, tokens) - rank(b.name, tokens))
    .map(({ entry }) => entry);
};
