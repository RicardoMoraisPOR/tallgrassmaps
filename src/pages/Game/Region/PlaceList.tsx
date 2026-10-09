import { useState } from 'react';

import { Search } from 'lucide-react';
import { Link } from 'react-router';

import type { PlaceGroups } from '@/data/maps';
import { cn } from '@/lib/utils';

import { groupOf, type Place } from '../places';
import { MapLegend } from './MapLegend';
import { PlaceIcon } from './PlaceIcon';

type Tab = string;

type PlaceListProps = {
  places: Array<Place>;
  placeGroups: PlaceGroups;
  href: (path: string) => string;
  className?: string;
};

export const PlaceList = ({
  places,
  placeGroups,
  href,
  className,
}: PlaceListProps) => {
  const tabs = [
    { id: 'all', label: 'All' },
    ...placeGroups.groups.map(({ id, label }) => ({ id, label })),
  ];
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('all');

  const search = query.trim().toLowerCase();
  const matches = (place: Place) =>
    !search ||
    place.location.name.toLowerCase().includes(search) ||
    place.location.locations.some((child) =>
      child.name.toLowerCase().includes(search),
    );
  const inTab = (place: Place, id: Tab) =>
    id === 'all' || groupOf(placeGroups, place.location.kind).id === id;
  const rows = places.filter((place) => inTab(place, tab) && matches(place));

  return (
    <section
      aria-label="All places"
      className={cn(
        'flex flex-col overflow-hidden rounded-[14px] border bg-card',
        className,
      )}
    >
      <div className="flex flex-col gap-2.5 border-b p-3">
        <label className="flex h-10 items-center gap-2 rounded-[10px] border border-input bg-background px-3 dark:bg-input/30">
          <Search className="size-4 flex-none text-muted-foreground" />
          <span className="sr-only">Search places</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeGroups.search}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>
        <div
          role="tablist"
          aria-label="Place type"
          className="flex gap-0.5 rounded-[10px] bg-muted p-0.75"
        >
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                'inline-flex h-7.5 flex-auto items-center justify-center gap-1 rounded-[7px] px-1.5 text-[13px] font-medium whitespace-nowrap text-muted-foreground transition-colors',
                tab === id &&
                  'bg-background text-foreground shadow-[0_1px_2px_oklch(0_0_0/0.12),0_0_0_1px_var(--border)]',
              )}
            >
              {label}
              <span className="font-mono text-[11px] opacity-60">
                {places.filter((place) => inTab(place, id)).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <ul className="flex max-h-95 min-h-0 flex-col overflow-y-auto p-1.5 lg:max-h-none lg:flex-1">
        {rows.map(({ path, location }) => (
          <li key={path}>
            <Link
              to={href(path)}
              className="flex min-h-11 w-full items-center gap-3 rounded-lg px-2.5 text-left text-sm transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
            >
              <PlaceIcon
                shape={groupOf(placeGroups, location.kind).icon}
                className="text-muted-foreground"
              />
              <span className="min-w-0 flex-1 truncate">{location.name}</span>
            </Link>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground">
            No places match “{query}”.
            <button
              type="button"
              onClick={() => setQuery('')}
              className="h-8 rounded-full border border-input px-3 text-[13px] font-medium text-foreground hover:bg-muted"
            >
              Clear search
            </button>
          </li>
        )}
      </ul>
      <div className="border-t px-4 py-3">
        <MapLegend placeGroups={placeGroups} />
      </div>
    </section>
  );
};
