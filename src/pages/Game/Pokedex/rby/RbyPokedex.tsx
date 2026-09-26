import { useState } from 'react';

import { Search } from 'lucide-react';

import { ToggleChip } from '@/components/ToggleChip';
import { gamesSharingMap } from '@/data/games';
import { rbyPokedex } from '@/data/pokedex/rby';
import type { PokedexEntry } from '@/data/pokedex/types';

import type { PokedexContentProps } from '../pokedexViews';
import { PokedexRow } from './PokedexRow';

type Toggle = 'exclusive' | 'trade' | 'obtainable';

const names = new Map(rbyPokedex.map((entry) => [entry.number, entry.name]));

const nameOf = (number: number) => names.get(number) ?? `#${number}`;

export const RbyPokedex = ({ game, region, href }: PokedexContentProps) => {
  const [query, setQuery] = useState('');
  const [toggles, setToggles] = useState<Array<Toggle>>([]);

  const setGames = gamesSharingMap(game).map(({ id }) => id);
  const shortName = game.name.replace(/^Pokémon /, '');
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
    obtainable: `Obtainable in ${shortName}`,
  };

  const matches = (entry: PokedexEntry) =>
    (!search ||
      entry.name.toLowerCase().includes(search) ||
      String(entry.number) === search) &&
    toggles.every((toggle) => checks[toggle](entry));
  const visible = rbyPokedex.filter(matches);

  const flip = (toggle: Toggle) =>
    setToggles((current) =>
      current.includes(toggle)
        ? current.filter((other) => other !== toggle)
        : [...current, toggle],
    );

  return (
    <div className="flex flex-col gap-3">
      <div className="sticky top-0 z-10 flex flex-col gap-2.5 bg-popover pb-3">
        <label className="flex h-10 items-center gap-2 rounded-[10px] border border-input bg-background px-3 dark:bg-input/30">
          <Search
            aria-hidden
            className="size-4 flex-none text-muted-foreground"
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
        <div
          role="group"
          aria-label="Filters"
          className="flex flex-wrap gap-1.5"
        >
          {(Object.keys(toggleLabels) as Array<Toggle>).map((toggle) => (
            <ToggleChip
              key={toggle}
              pressed={toggles.includes(toggle)}
              onClick={() => flip(toggle)}
            >
              {toggleLabels[toggle]}
            </ToggleChip>
          ))}
        </div>
        <p aria-live="polite" className="text-xs text-muted-foreground">
          {visible.length === rbyPokedex.length
            ? `${rbyPokedex.length} Pokémon`
            : `Showing ${visible.length} of ${rbyPokedex.length} Pokémon`}
        </p>
      </div>
      <ul aria-label="Pokémon" className="flex flex-col gap-1.5">
        {visible.map((entry) => (
          <PokedexRow
            key={entry.number}
            entry={entry}
            game={game}
            region={region}
            href={href}
            nameOf={nameOf}
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
