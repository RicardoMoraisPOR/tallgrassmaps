import { Search } from 'lucide-react';

import { ToggleChip } from '@/components/ToggleChip';

import type { PokedexSearchProps } from '../types';

export const TallGrassSearch = ({ search }: PokedexSearchProps) => (
  <div className="sticky top-0 z-10 flex flex-col gap-2.5 bg-popover pb-3">
    <label className="flex h-10 items-center gap-2 rounded-[10px] border border-input bg-background px-3 dark:bg-input/30">
      <Search aria-hidden className="size-4 flex-none text-muted-foreground" />
      <span className="sr-only">Search the Pokédex</span>
      <input
        type="search"
        value={search.query}
        onChange={(event) => search.setQuery(event.target.value)}
        placeholder="Search by name or number…"
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </label>
    {search.filters.length > 0 && (
      <div role="group" aria-label="Filters" className="flex flex-wrap gap-1.5">
        {search.filters.map(({ id, label }) => (
          <ToggleChip
            key={id}
            pressed={search.selected.includes(id)}
            onClick={() => search.toggle(id)}
          >
            {label}
          </ToggleChip>
        ))}
      </div>
    )}
    <p aria-live="polite" className="text-xs text-muted-foreground">
      {search.visible.length === search.total
        ? `${search.total} Pokémon`
        : `Showing ${search.visible.length} of ${search.total} Pokémon`}
    </p>
  </div>
);
