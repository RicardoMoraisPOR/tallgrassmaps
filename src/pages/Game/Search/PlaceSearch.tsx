import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Search } from 'lucide-react';
import { useNavigate } from 'react-router';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Game } from '@/data/games';
import { getLocation, type Region } from '@/data/maps';
import { pathSegments } from '@/lib/paths';
import { cn } from '@/lib/utils';

import { collectPlaces, groupOf, placeGroupsFor } from '../places';
import { searchPlaces } from '../placeSearch';
import { PlaceIcon } from '../Region/PlaceIcon';
import { toolbarButtonClass } from '../toolbarButton';
import {
  OpenContext,
  searchShortcut,
  useOpenPlaceSearch,
} from './searchContext';

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

type PlaceSearchProviderProps = {
  game: Game;
  region: Region;
  href: (path: string) => string;
  children: ReactNode;
};

export const PlaceSearchProvider = ({
  game,
  region,
  href,
  children,
}: PlaceSearchProviderProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      const palette =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      const slash = event.key === '/' && !isTyping(event.target);

      if (!palette && !slash) return;

      event.preventDefault();
      setOpen(true);
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <OpenContext value={() => setOpen(true)}>
      {children}
      <PlaceSearchDialog
        key={game.id}
        open={open}
        onOpenChange={setOpen}
        game={game}
        region={region}
        href={href}
      />
    </OpenContext>
  );
};

type PlaceSearchButtonProps = {
  floating?: boolean;
};

export const PlaceSearchButton = ({
  floating = false,
}: PlaceSearchButtonProps) => {
  const open = useOpenPlaceSearch();

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Search places"
      title="Search places"
      className={cn(
        toolbarButtonClass,
        'text-foreground',
        floating &&
          'absolute top-4 right-20 z-30 rounded-[14px] border-l md:right-16',
      )}
    >
      <Search aria-hidden className="size-5 flex-none md:size-4" />
      <span className="hidden text-[13px] font-medium md:inline">Search</span>
      <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 font-sans text-[11px] text-muted-foreground lg:inline">
        {searchShortcut()}
      </kbd>
    </button>
  );
};

type PlaceSearchDialogProps = Omit<PlaceSearchProviderProps, 'children'> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const PlaceSearchDialog = ({
  open,
  onOpenChange,
  game,
  region,
  href,
}: PlaceSearchDialogProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const placeGroups = placeGroupsFor(region);
  const places = useMemo(
    () => collectPlaces(region, game.id),
    [region, game.id],
  );
  const results = useMemo(() => {
    const found = searchPlaces(places, query);

    return placeGroups.groups.flatMap((group) =>
      found.filter(
        (place) => groupOf(placeGroups, place.location.kind).id === group.id,
      ),
    );
  }, [places, query, placeGroups]);

  useEffect(() => {
    listRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [active, results]);

  const reset = (next: boolean) => {
    onOpenChange(next);

    if (!next) {
      setQuery('');
      setActive(0);
    }
  };

  const go = (path: string) => {
    navigate(href(path));
    reset(false);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setActive(
        (current) =>
          (current + (event.key === 'ArrowDown' ? 1 : -1) + results.length) %
          Math.max(results.length, 1),
      );
    }

    if (event.key === 'Enter' && results[active]) {
      event.preventDefault();
      go(results[active].path);
    }
  };

  const parentName = (path: string) => {
    const parent = pathSegments(path).slice(0, -1).join('/');

    return parent ? getLocation(region, parent)?.name : undefined;
  };

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogContent
        showCloseButton={false}
        className="top-[10svh] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-lg md:top-[14svh]"
      >
        <DialogTitle className="sr-only">Search places</DialogTitle>
        <DialogDescription className="sr-only">
          Find a town, route, building or cave and jump straight to it.
        </DialogDescription>
        <label className="flex h-12 items-center gap-3 border-b px-4">
          <Search
            aria-hidden
            className="size-4 flex-none text-muted-foreground"
          />
          <span className="sr-only">Search places</span>
          <input
            autoFocus
            type="search"
            role="combobox"
            aria-expanded
            aria-controls="place-search-results"
            aria-activedescendant={
              results[active] ? `place-${results[active].path}` : undefined
            }
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder={placeGroups.search}
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
        </label>
        <ul
          ref={listRef}
          id="place-search-results"
          role="listbox"
          aria-label="Places"
          className="max-h-[min(60svh,26rem)] overflow-y-auto overscroll-contain p-1.5"
        >
          {results.map((place, index) => {
            const group = groupOf(placeGroups, place.location.kind);
            const heading =
              index === 0 ||
              groupOf(placeGroups, results[index - 1].location.kind).id !==
                group.id;
            const parent = parentName(place.path);

            return (
              <li key={place.path} role="presentation">
                {heading && (
                  <p className="px-2.5 pt-2 pb-1 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    {group.label}
                  </p>
                )}
                <button
                  type="button"
                  id={`place-${place.path}`}
                  role="option"
                  aria-selected={index === active}
                  onClick={() => go(place.path)}
                  onMouseMove={() => setActive(index)}
                  className={cn(
                    'flex min-h-11 w-full items-center gap-3 rounded-lg px-2.5 text-left text-sm',
                    index === active && 'bg-muted',
                  )}
                >
                  <PlaceIcon
                    shape={group.icon}
                    className="text-muted-foreground"
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {place.location.name}
                    {parent && (
                      <span className="text-muted-foreground"> · {parent}</span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
          {results.length === 0 && (
            <li
              role="presentation"
              className="px-4 py-8 text-center text-sm text-muted-foreground"
            >
              No places match “{query}”.
            </li>
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
};
