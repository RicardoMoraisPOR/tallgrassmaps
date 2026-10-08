import { Search } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { PokedexSearchProps } from '../types';
import { ZaBall } from './ZaBall';

export const ZaSearch = ({ search }: PokedexSearchProps) => (
  <div className="flex flex-col gap-3 px-4 pt-4 pb-3">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p
        aria-live="polite"
        className="flex items-center gap-4 text-xl font-bold tabular-nums"
      >
        <span className="flex items-center gap-2">
          <ZaBall className="size-5" />
          {String(search.visible.length).padStart(3, '0')}
        </span>
        <span className="flex items-center gap-2 text-white/70">
          <ZaBall caught={false} className="size-5" />
          {String(search.total).padStart(3, '0')}
        </span>
        <span className="sr-only">Pokémon shown out of the total</span>
      </p>
      <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md border border-white/25 bg-black/20 px-3 focus-within:border-(--za-green) sm:max-w-xs">
        <Search aria-hidden className="size-4 flex-none text-white/80" />
        <span className="sr-only">Search the Pokédex</span>
        <input
          type="search"
          value={search.query}
          onChange={(event) => search.setQuery(event.target.value)}
          placeholder="Search by name or number…"
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-white/60"
        />
      </label>
    </div>
    {search.filters.length > 0 && (
      <div role="group" aria-label="Filters" className="flex flex-wrap gap-2">
        {search.filters.map(({ id, label }) => {
          const pressed = search.selected.includes(id);

          return (
            <button
              key={id}
              type="button"
              aria-pressed={pressed}
              onClick={() => search.toggle(id)}
              className={cn(
                'h-8 rounded-md border border-white/25 bg-white/10 px-3 text-sm font-bold whitespace-nowrap transition-colors outline-none hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-(--za-green)',
                pressed &&
                  'border-white bg-white text-(--za-deep) hover:bg-white/90',
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    )}
  </div>
);
