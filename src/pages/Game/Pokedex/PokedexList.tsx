import { useState } from 'react';

import { Search } from 'lucide-react';

import { ToggleChip } from '@/components/ToggleChip';
import { gamesSharingMap } from '@/data/games';
import type { PokedexEntry } from '@/data/pokedex/types';

import { PokedexRow } from './PokedexRow';
import type { PokedexContentProps } from './pokedexViews';

type Toggle = 'exclusive' | 'trade' | 'obtainable';

type PokedexListProps = PokedexContentProps & {
  entries: Array<PokedexEntry>;
  versionFilters?: boolean;
};

export const PokedexList = ({
  entries,
  versionFilters = false,
  game,
  region,
  href,
  focus,
}: PokedexListProps) => {
  const [query, setQuery] = useState('');
  const [toggles, setToggles] = useState<Array<Toggle>>([]);
  const setGames = gamesSharingMap(game).map(({ id }) => id);
  const search = query.trim().toLowerCase().replace(/^#0*/, '');

  const checks: Record<Toggle, (entry: PokedexEntry) => boolean> = {
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

  const toggleLabels: Record<Toggle, string> = {
    exclusive: 'Version exclusive',
    trade: 'In-game trade',
    obtainable: `Obtainable in ${game.shortName}`,
  };

  const availableToggles = versionFilters
    ? (Object.keys(toggleLabels) as Array<Toggle>)
    : [];

  const matches = (entry: PokedexEntry) =>
    (!search ||
      entry.name.toLowerCase().includes(search) ||
      String(entry.id) === search) &&
    toggles.every((toggle) => checks[toggle](entry));
  
  const visible = entries.filter(matches);
  
  const flip = (toggle: Toggle) =>
    setToggles((current) =>
      current.includes(toggle)
        ? current.filter((other) => other !== toggle)
        : [...current, toggle],
    );
  
  const names = new Map(entries.map((entry) => [entry.number, entry.name]));
  const nameOf = (number: number) => names.get(number) ?? `#${number}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="sticky top-0 z-10 flex flex-col gap-2.5 bg-popover pb-3">
        <label className="flex h-10 items-center gap-2 rounded-[10px] border border-input bg-background px-3 dark:bg-input/30 pokedex-game:rounded-none pokedex-game:border-2">
          <Search
            aria-hidden
            className="size-4 flex-none text-muted-foreground pokedex-game:text-foreground"
          />
          <span className="sr-only">Search the Pokédex</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or number…"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>
        {availableToggles.length > 0 && (
          <div
            role="group"
            aria-label="Filters"
            className="flex flex-wrap gap-1.5 pokedex-game:gap-x-3"
          >
            {availableToggles.map((toggle) => (
              <ToggleChip
                key={toggle}
                pressed={toggles.includes(toggle)}
                onClick={() => flip(toggle)}
              >
                {toggleLabels[toggle]}
              </ToggleChip>
            ))}
          </div>
        )}
        <p aria-live="polite" className="text-xs text-muted-foreground">
          {visible.length === entries.length
            ? `${entries.length} Pokémon`
            : `Showing ${visible.length} of ${entries.length} Pokémon`}
        </p>
      </div>
      <ul
        aria-label="Pokémon"
        className="flex flex-col gap-1.5 pokedex-game:gap-0"
      >
        {visible.map((entry) => (
          <PokedexRow
            key={entry.id}
            entry={entry}
            game={game}
            region={region}
            href={href}
            nameOf={nameOf}
            focused={entry.number === focus}
          />
        ))}
      </ul>
      {visible.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No Pokémon match these filters.
        </p>
      )}
    </div>
  );
};
