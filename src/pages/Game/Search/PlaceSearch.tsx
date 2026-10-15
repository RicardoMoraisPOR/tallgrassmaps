import { type ReactNode, useEffect, useState } from 'react';

import { Search } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Game } from '@/data/games';
import { getLocation, type Region } from '@/data/maps';
import { cn } from '@/lib/utils';

import { TrainerDialog } from '../Location/TrainerDialog';
import { toolbarButtonClass } from '../toolbarButton';
import {
  OpenContext,
  searchShortcut,
  useOpenPlaceSearch,
} from './searchContext';
import {
  ItemResult,
  PlaceResult,
  PokemonResult,
  SearchScope,
  SearchTabs,
  TrainerResult,
} from './SearchParts';
import { MAX_QUERY_LENGTH, usePlaceSearch } from './usePlaceSearch';

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

export const PlaceSearchButton = () => {
  const open = useOpenPlaceSearch();

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Search places"
      title="Search places"
      className={cn(toolbarButtonClass, 'text-foreground')}
    >
      <Search aria-hidden className="size-5 flex-none md:size-4" />
      <span className="hidden text-xs font-medium md:inline">Search</span>
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
  const {
    query,
    setQuery,
    active,
    setActive,
    tab,
    setTab,
    searching,
    results,
    listRef,
    placeGroups,
    parentName,
    placeOf,
    headingOf,
    go,
    onKeyDown,
    reset,
    battles,
    entries,
    openedTrainer,
    setTrainerKey,
  } = usePlaceSearch({ game, region, href, onOpenChange });

  return (
    <>
      <Dialog open={open} onOpenChange={reset}>
        <DialogContent
          showCloseButton={false}
          className="top-[10svh] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-lg md:top-[14svh]"
        >
          <DialogTitle className="sr-only">Search places</DialogTitle>
          <DialogDescription className="sr-only">
            Find a town, route, building or cave and jump straight to it.
          </DialogDescription>
          <SearchScope game={game} region={region} />
          <label className="flex h-12 items-center gap-3 border-y px-4">
            <Search
              aria-hidden
              className="size-4 flex-none text-muted-foreground"
            />
            <span className="sr-only">Search places</span>
            <input
              autoFocus
              type="search"
              maxLength={MAX_QUERY_LENGTH}
              role="combobox"
              aria-expanded
              aria-controls="search-results"
              aria-activedescendant={
                results[active] ? `result-${results[active].key}` : undefined
              }
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Search anything…"
              className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
          </label>
          <SearchTabs tab={tab} onChange={setTab} />
          <ul
            hidden={!searching}
            ref={listRef}
            id="search-results"
            role="listbox"
            aria-label="Results"
            className="max-h-[min(60svh,26rem)] overflow-y-auto overscroll-contain p-1.5"
          >
            {results.map((result, index) => {
              const heading =
                index === 0 ||
                headingOf(results[index - 1]) !== headingOf(result);

              return (
                <li key={result.key} role="presentation">
                  {heading && (
                    <p className="px-2.5 pt-2 pb-1 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                      {headingOf(result)}
                    </p>
                  )}
                  <button
                    type="button"
                    id={`result-${result.key}`}
                    role="option"
                    aria-selected={index === active}
                    onClick={() => go(result)}
                    onMouseMove={() => setActive(index)}
                    className={cn(
                      'flex min-h-11 w-full items-center gap-3 rounded-lg px-2.5 text-left text-sm',
                      index === active && 'bg-muted',
                    )}
                  >
                    {result.type === 'place' ? (
                      <PlaceResult
                        result={result.place}
                        placeGroups={placeGroups}
                        parent={parentName(result.place.path)}
                      />
                    ) : result.type === 'trainer' ? (
                      <TrainerResult
                        listed={result.listed}
                        place={placeOf(
                          result.listed.battle.path,
                          result.listed.battle.floor,
                          result.listed.battle.area,
                        )}
                      />
                    ) : result.type === 'item' ? (
                      <ItemResult
                        item={result.item}
                        place={placeOf(result.item.path, result.item.floor)}
                      />
                    ) : (
                      <PokemonResult entry={result.entry} game={game} />
                    )}
                  </button>
                </li>
              );
            })}
            {searching && results.length === 0 && (
              <li
                role="presentation"
                className="px-4 py-8 text-center text-sm text-muted-foreground"
              >
                Nothing came up for “{query}”.
              </li>
            )}
          </ul>
        </DialogContent>
      </Dialog>
      <TrainerDialog
        listed={openedTrainer}
        battles={battles.filter(
          ({ battle }) =>
            battle.path === openedTrainer?.battle.path &&
            battle.floor === openedTrainer.battle.floor,
        )}
        place={
          getLocation(region, openedTrainer?.battle.path ?? '')?.name ?? ''
        }
        game={game}
        pokedex={entries}
        href={href}
        onSelect={setTrainerKey}
        onClose={() => setTrainerKey(undefined)}
      />
    </>
  );
};
