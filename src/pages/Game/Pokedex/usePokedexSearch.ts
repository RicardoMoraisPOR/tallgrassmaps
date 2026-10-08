import { useState } from 'react';

import { type Game, gamesSharingMap } from '@/data/games';
import type { PokedexEntry } from '@/data/pokedex/types';

export type PokedexFilterId =
  | 'exclusive'
  | 'trade'
  | 'trade-only'
  | 'obtainable'
  | 'mega';

export type PokedexFilter = { id: PokedexFilterId; label: string };

export type PokedexSearchState = {
  query: string;
  setQuery: (query: string) => void;
  filters: Array<PokedexFilter>;
  selected: Array<PokedexFilterId>;
  toggle: (id: PokedexFilterId) => void;
  reset: () => void;
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
    'trade-only': (entry) => entry.evolvesFrom?.method === 'trade',
    obtainable: (entry) => entry.games.includes(game.id),
    mega: (entry) => !!entry.megas?.length,
  };

  const filters: Array<PokedexFilter> = [
    ...(setGames.length > 1
      ? [
          { id: 'exclusive' as const, label: 'Version exclusive' },
          {
            id: 'obtainable' as const,
            label: `Obtainable in ${game.shortName}`,
          },
        ]
      : []),
    ...(entries.some((entry) => checks.trade(entry))
      ? [{ id: 'trade' as const, label: 'In Game Trade' }]
      : []),
    ...(entries.some((entry) => checks['trade-only'](entry))
      ? [{ id: 'trade-only' as const, label: 'Only by Trading' }]
      : []),
    ...(entries.some((entry) => entry.megas?.length)
      ? [{ id: 'mega' as const, label: 'Mega Evolution' }]
      : []),
  ];

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

  const reset = () => {
    setQuery(initial.query ?? '');
    setSelected(initial.selected ?? []);
  };

  return {
    query,
    setQuery,
    filters,
    selected,
    toggle,
    reset,
    visible: entries.filter(matches),
    total: entries.length,
  };
};
