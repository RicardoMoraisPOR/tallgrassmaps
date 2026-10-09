import {
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Backpack, MapPin, CircleDot, Search, Swords } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';

import { ColorStripe } from '@/components/GameCover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { versionGroupNames } from '@/data/catalog/versionGroups';
import type { Game } from '@/data/games';
import { itemsFor } from '@/data/items';
import type { MapItem } from '@/data/items/types';
import { getLocation, type Region } from '@/data/maps';
import { pokedexFor } from '@/data/pokedex';
import type { PokedexEntry } from '@/data/pokedex/types';
import { trainersFor } from '@/data/trainers';
import { usePokemonSprite } from '@/hooks/usePokemonSprite';
import { pathSegments } from '@/lib/paths';
import { formatList } from '@/lib/utils';
import { cn } from '@/lib/utils';

import { ColorDot } from '../ColorDot';
import { searchItems } from '../itemSearch';
import { itemKey } from '../Location/links/items';
import { TrainerDialog } from '../Location/TrainerDialog';
import { listBattles, type ListedBattle } from '../Location/trainerList';
import { TrainerSprite } from '../Location/TrainerSprite';
import { collectPlaces, groupOf, type Place, placeGroupsFor } from '../places';
import { searchPlaces } from '../placeSearch';
import { pokedexLink } from '../Pokedex/usePokedex';
import { searchPokemon } from '../pokemonSearch';
import { PlaceIcon } from '../Region/PlaceIcon';
import { toolbarButtonClass } from '../toolbarButton';
import { searchTrainers } from '../trainerSearch';
import {
  OpenContext,
  searchShortcut,
  useOpenPlaceSearch,
} from './searchContext';

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

const MAX_QUERY_LENGTH = 60;
const MIN_QUERY_LENGTH = 2;

const TABS = ['Locations', 'Pokémon', 'Trainers', 'Items'] as const;

const TAB_ICONS = {
  Locations: MapPin,
  Pokémon: CircleDot,
  Trainers: Swords,
  Items: Backpack,
};

type SearchTab = (typeof TABS)[number];

type Result =
  | { type: 'place'; key: string; place: Place }
  | { type: 'pokemon'; key: string; entry: PokedexEntry }
  | { type: 'trainer'; key: string; listed: ListedBattle }
  | { type: 'item'; key: string; item: MapItem };

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
  const [params] = useSearchParams();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [tab, setTab] = useState<SearchTab | null>(null);
  const [trainerKey, setTrainerKey] = useState<string>();
  const listRef = useRef<HTMLUListElement>(null);

  const searching = tab !== null || query.trim().length >= MIN_QUERY_LENGTH;
  const placeGroups = placeGroupsFor(region);
  const parentName = useCallback(
    (path: string) => {
      const parent = pathSegments(path).slice(0, -1).join('/');

      return parent ? getLocation(region, parent)?.name : undefined;
    },
    [region],
  );

  const places = useMemo(
    () => collectPlaces(region, game.id),
    [region, game.id],
  );
  const entries = useMemo(
    () => pokedexFor(region.versionGroup) ?? [],
    [region.versionGroup],
  );
  const battles = useMemo(
    () => listBattles(trainersFor(region.versionGroup) ?? [], game),
    [region.versionGroup, game],
  );
  const items = useMemo(
    () =>
      itemsFor(region.versionGroup)?.filter(({ games }) =>
        games.includes(game.id),
      ) ?? [],
    [region.versionGroup, game.id],
  );
  const results = useMemo(() => {
    if (!searching) return [];

    const found: Array<Result> = [];

    if (tab === null || tab === 'Locations') {
      const matches = searchPlaces(places, query, ({ path }) =>
        parentName(path),
      );

      for (const group of placeGroups.groups) {
        for (const place of matches) {
          if (groupOf(placeGroups, place.location.kind).id === group.id) {
            found.push({ type: 'place', key: place.path, place });
          }
        }
      }
    }

    if (tab === null || tab === 'Pokémon') {
      for (const entry of searchPokemon(entries, query)) {
        found.push({ type: 'pokemon', key: `pokemon-${entry.number}`, entry });
      }
    }

    if (tab === null || tab === 'Trainers') {
      for (const listed of searchTrainers(battles, query)) {
        found.push({ type: 'trainer', key: listed.key, listed });
      }
    }

    if (tab === null || tab === 'Items') {
      for (const item of searchItems(items, query)) {
        found.push({ type: 'item', key: itemKey(item), item });
      }
    }

    return found;
  }, [
    places,
    entries,
    battles,
    items,
    query,
    tab,
    searching,
    placeGroups,
    parentName,
  ]);

  const placeOf = (path: string, floorId?: string, area?: string) => {
    const location = getLocation(region, path);
    const floor = location?.floors?.find(({ id }) => id === floorId);

    return [location?.name, floor?.name ?? area].filter(Boolean).join(' · ');
  };

  const openedTrainer = battles.find(({ key }) => key === trainerKey);

  const headingOf = (result: Result) =>
    result.type === 'pokemon'
      ? 'Pokémon'
      : result.type === 'trainer'
        ? 'Trainers'
        : result.type === 'item'
          ? 'Items'
          : groupOf(placeGroups, result.place.location.kind).label;

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

  const go = (result: Result) => {
    if (result.type === 'place') {
      navigate(href(result.place.path));
    } else if (result.type === 'trainer') {
      setTrainerKey(result.listed.key);
    } else if (result.type === 'item') {
      const { item } = result;
      const floor = item.floor ? `?floor=${item.floor}` : '';

      navigate(`${href(item.path)}${floor}`, {
        state: { focusKey: itemKey(item) },
      });
    } else {
      const { to, state } = pokedexLink(params, result.entry.number);

      navigate(to, { state });
    }

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
      go(results[active]);
    }
  };

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

type PlaceResultProps = {
  result: Place;
  placeGroups: ReturnType<typeof placeGroupsFor>;
  parent?: string;
};

const PlaceResult = ({ result, placeGroups, parent }: PlaceResultProps) => (
  <>
    <PlaceIcon
      shape={groupOf(placeGroups, result.location.kind).icon}
      className="text-muted-foreground"
    />
    <span className="min-w-0 flex-1 truncate">
      {result.location.name}
      {parent && <span className="text-muted-foreground"> · {parent}</span>}
    </span>
  </>
);

type TrainerResultProps = {
  listed: ListedBattle;
  place: string;
};

const TrainerResult = ({ listed, place }: TrainerResultProps) => (
  <>
    {listed.battle.sprite ? (
      <TrainerSprite src={listed.battle.sprite} />
    ) : (
      <span aria-hidden className="size-8 flex-none" />
    )}
    <span className="min-w-0 flex-1 truncate">
      {listed.label}
      {place && <span className="text-muted-foreground"> · {place}</span>}
    </span>
  </>
);

type ItemResultProps = {
  item: MapItem;
  place: string;
};

const ItemResult = ({ item, place }: ItemResultProps) => (
  <>
    {item.sprite ? (
      <TrainerSprite src={item.sprite} />
    ) : (
      <Backpack
        aria-hidden
        className="mx-1.5 size-5 flex-none text-muted-foreground"
      />
    )}
    <span className="min-w-0 flex-1 truncate">
      {item.item}
      {item.hidden && <span className="text-muted-foreground"> (hidden)</span>}
      {place && <span className="text-muted-foreground"> · {place}</span>}
    </span>
  </>
);

type PokemonResultProps = {
  entry: PokedexEntry;
  game: Game;
};

const PokemonResult = ({ entry, game }: PokemonResultProps) => {
  const sprite = usePokemonSprite(game)(entry.number);

  return (
    <>
      <img
        src={sprite.src}
        alt=""
        loading="lazy"
        className={cn(
          'size-8 flex-none object-contain',
          sprite.pixelated && 'pixelated',
        )}
      />
      <span className="min-w-0 flex-1 truncate">{entry.name}</span>
      <span className="flex-none text-xs text-muted-foreground tabular-nums">
        #{entry.id}
        {entry.number !== entry.id && ` · National #${entry.number}`}
      </span>
    </>
  );
};

type SearchTabsProps = {
  tab: SearchTab | null;
  onChange: (tab: SearchTab | null) => void;
};

const SearchTabs = ({ tab, onChange }: SearchTabsProps) => (
  <div
    role="tablist"
    aria-label="Search category"
    className="flex border-b bg-muted/30 px-2 pt-1.5"
  >
    {TABS.map((name) => {
      const Icon = TAB_ICONS[name];
      const selected = name === tab;

      return (
        <button
          key={name}
          type="button"
          role="tab"
          aria-selected={selected}
          onClick={() => onChange(selected ? null : name)}
          className={cn(
            '-mb-px flex h-9 flex-1 items-center justify-center gap-1.5 rounded-t-lg border border-b-0 px-2 text-[13px] font-medium',
            selected
              ? 'border-border bg-background text-foreground'
              : 'border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground',
          )}
        >
          <Icon aria-hidden className="size-3.5 flex-none" />
          <span className="truncate">{name}</span>
        </button>
      );
    })}
  </div>
);

const SearchScope = ({ game, region }: { game: Game; region: Region }) => (
  <div
    title={`Searching ${game.fullName} · same maps in ${formatList(versionGroupNames(region.versionGroup))}`}
    className="bg-muted/40"
  >
    <ColorStripe colors={game.colors} />
    <p className="flex items-center gap-3 px-4 py-2.5 text-xs">
      <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
        Searching in
      </span>
      <span className="flex min-w-0 items-center gap-1.5 truncate text-sm font-medium">
        <ColorDot color={game.colors[0]} />
        <span className="truncate">{game.fullName}</span>
      </span>
    </p>
  </div>
);
