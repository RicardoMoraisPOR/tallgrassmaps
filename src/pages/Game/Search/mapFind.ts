import { useCallback, useMemo } from 'react';

import { useSearchParams } from 'react-router';

import type { Game } from '@/data/games';
import type { Region } from '@/data/maps';

import { searchItems } from '../itemSearch';
import { encounterHighlightKey } from '../Location/encounters';
import { itemKey } from '../Location/links/items';
import { npcKey } from '../Location/links/npcs';
import { searchNpcs } from '../npcSearch';
import { searchPokemon } from '../pokemonSearch';
import { searchTrainers } from '../trainerSearch';
import { useSearchSources } from './useSearchSources';

const FIND_PARAM = 'find';

export const findHref = (href: string, query: string) =>
  `${href}?${FIND_PARAM}=${encodeURIComponent(query)}`;

export const findMatchKey = (path: string, key: string) => `${path}|${key}`;

const topPath = (path: string) => path.split('/')[0];

export const useMapFind = (game: Game, region: Region) => {
  const [params, setParams] = useSearchParams();
  const query = params.get(FIND_PARAM)?.trim() ?? '';
  const { entries, battles, items, npcs } = useSearchSources(game, region);

  const found = useMemo(() => {
    const matches = new Set<string>();
    const tiles = new Set<string>();
    let count = 0;

    if (!query) return { matches, tiles, count };

    const add = (path: string, key: string | undefined) => {
      tiles.add(topPath(path));

      if (key) matches.add(findMatchKey(path, key));
    };

    for (const entry of searchPokemon(entries, query)) {
      count++;

      for (const encounter of entry.encounters) {
        if (!encounter.path || !encounter.games.includes(game.id)) continue;

        add(encounter.path, encounterHighlightKey({ entry, encounter }));
      }
    }

    for (const item of searchItems(items, query)) {
      count++;
      add(item.path, itemKey(item));
    }

    for (const listed of searchTrainers(battles, query)) {
      count++;
      add(listed.battle.path, listed.key);
    }

    for (const npc of searchNpcs(npcs, query)) {
      count++;
      add(npc.path, npcKey(npc));
    }

    return { matches, tiles, count };
  }, [query, entries, items, battles, npcs, game.id]);

  const clear = useCallback(
    () =>
      setParams(
        (current) => {
          const next = new URLSearchParams(current);

          next.delete(FIND_PARAM);

          return next;
        },
        { replace: true },
      ),
    [setParams],
  );

  return { query, ...found, clear };
};
