import { useState } from 'react';

import { type Game, gamesSharingMap } from '@/data/games';
import type { PokedexEntry } from '@/data/pokedex/types';

export type PokedexFilterId = 'exclusive' | 'trade' | 'obtainable';

export type PokedexFilter = { id: PokedexFilterId; label: string };

export type PokedexSearchState = {
  query: string;
  setQuery: (query: string) => void;
  filters: Array<PokedexFilter>;
  selected: Array<PokedexFilterId>;
  toggle: (id: PokedexFilterId) => void;
  visible: Array<PokedexEntry>;
  total: number;
};

type InitialSearch = {
  query?: string;
  selected?: Array<PokedexFilterId>;
};

export const usePokedexSearch = (
  entries: Array<PokedexEntry>,
  game: Game,
  initial: InitialSearch = {},
): PokedexSearchState => {
  const [query, setQuery] = useState(initial.query ?? '');
  const [selected, setSelected] = useState<Array<PokedexFilterId>>(
    initial.selected ?? [],
  );

  const setGames = gamesSharingMap(game).map(({ id }) => id);
  const search = query.trim().toLowerCase().replace(/^#0*/, '');

  const checks: Record<PokedexFilterId, (entry: PokedexEntry) => boolean> = {
    exclusive: (entry) =>
      entry.games.length > 0 &&
      setGames.some((id) => !entry.games.includes(id)),
    trade: (entry) =>
      entry.encounters.some(
        (encounter) =>
          encounter.method === 'trade' && encounter.games.includes(game.id),
      ),
    obtainable: (entry) => entry.games.includes(game.id),
  };

  const filters: Array<PokedexFilter> =
    setGames.length > 1
      ? [
          { id: 'exclusive', label: 'Version exclusive' },
          { id: 'trade', label: 'In-game trade' },
          { id: 'obtainable', label: `Obtainable in ${game.shortName}` },
        ]
      : [];

  const matches = (entry: PokedexEntry) =>
    (!search ||
      entry.name.toLowerCase().includes(search) ||
      String(entry.id) === search) &&
    selected.every((id) => checks[id](entry));

  const toggle = (id: PokedexFilterId) =>
    setSelected((current) =>
      current.includes(id)
        ? current.filter((other) => other !== id)
        : [...current, id],
    );

  return {
    query,
    setQuery,
    filters,
    selected,
    toggle,
    visible: entries.filter(matches),
    total: entries.length,
  };
};
