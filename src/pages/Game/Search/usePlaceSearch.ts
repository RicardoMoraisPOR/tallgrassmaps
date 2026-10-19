import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useNavigate, useSearchParams } from 'react-router';

import type { Game } from '@/data/games';
import type { MapItem } from '@/data/items/types';
import { getLocation, type Region, regionHref } from '@/data/maps';
import type { MapNpc } from '@/data/npcs/types';
import { entryKey } from '@/data/pokedex/master';
import type { PokedexEntry } from '@/data/pokedex/types';
import { pathSegments } from '@/lib/paths';
import { useSettingsStore } from '@/stores/settings';

import { searchItems } from '../itemSearch';
import { itemKey } from '../Location/links/items';
import { npcKey } from '../Location/links/npcs';
import type { ListedBattle } from '../Location/trainerList';
import { searchNpcs } from '../npcSearch';
import { collectPlaces, groupOf, type Place, placeGroupsFor } from '../places';
import { searchPlaces } from '../placeSearch';
import { pokedexLink } from '../Pokedex/usePokedex';
import { searchPokemon } from '../pokemonSearch';
import { searchTrainers } from '../trainerSearch';
import { findHref } from './mapFind';
import { useSearchSources } from './useSearchSources';

export const MAX_QUERY_LENGTH = 60;
const MIN_QUERY_LENGTH = 2;

export const TABS = [
  'Locations',
  'Pokémon',
  'Trainers',
  'Items',
  'NPCs',
] as const;

export type SearchTab = (typeof TABS)[number];

export type Result =
  | { type: 'place'; key: string; place: Place }
  | { type: 'pokemon'; key: string; entry: PokedexEntry }
  | { type: 'trainer'; key: string; listed: ListedBattle }
  | { type: 'item'; key: string; item: MapItem }
  | { type: 'npc'; key: string; npc: MapNpc };

type PlaceSearchOptions = {
  game: Game;
  region: Region;
  href: (path: string) => string;
  onOpenChange: (open: boolean) => void;
};

export const usePlaceSearch = ({
  game,
  region,
  href,
  onOpenChange,
}: PlaceSearchOptions) => {
  const navigate = useNavigate();
  const setWorldPreferred = useSettingsStore((state) => state.setWorldView);
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
  const { entries, battles, items, npcs } = useSearchSources(game, region);
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
        found.push({
          type: 'pokemon',
          key: `pokemon-${entryKey(entry)}`,
          entry,
        });
      }
    }

    if (tab === null || tab === 'Trainers') {
      for (const listed of searchTrainers(battles, query)) {
        found.push({ type: 'trainer', key: listed.key, listed });
      }
    }

    if (tab === null || tab === 'Items') {
      for (const item of searchItems(items, query)) {
        found.push({
          type: 'item',
          key: `${itemKey(item)}:${item.item}`,
          item,
        });
      }
    }

    if (tab === null || tab === 'NPCs') {
      for (const npc of searchNpcs(npcs, query)) {
        found.push({ type: 'npc', key: npcKey(npc), npc });
      }
    }

    return found;
  }, [
    places,
    entries,
    battles,
    items,
    npcs,
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
          : result.type === 'npc'
            ? 'Special NPCs'
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
    } else if (result.type === 'npc') {
      const { npc } = result;
      const floor = npc.floor ? `?floor=${npc.floor}` : '';

      navigate(`${href(npc.path)}${floor}`, {
        state: { focusKey: npcKey(npc) },
      });
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

  const canShowOnMap =
    Boolean(region.world) &&
    results.some(({ type }) => type !== 'place') &&
    query.trim().length >= MIN_QUERY_LENGTH;

  const showOnMap = () => {
    setWorldPreferred(true);
    navigate(findHref(regionHref(game.id, region), query.trim()));
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

  return {
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
    canShowOnMap,
    showOnMap,
    reset,
    battles,
    entries,
    openedTrainer,
    setTrainerKey,
  };
};
