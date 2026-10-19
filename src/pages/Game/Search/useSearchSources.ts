import { useMemo } from 'react';

import type { Game } from '@/data/games';
import { itemsFor } from '@/data/items';
import type { Region } from '@/data/maps';
import { npcsFor } from '@/data/npcs';
import { pokedexFor } from '@/data/pokedex';
import { trainersFor } from '@/data/trainers';

import { listBattles } from '../Location/trainerList';
import { giftItems } from './giftItems';

export const useSearchSources = (game: Game, region: Region) => {
  const entries = useMemo(
    () => pokedexFor(region.versionGroup) ?? [],
    [region.versionGroup],
  );
  const battles = useMemo(
    () => listBattles(trainersFor(region.versionGroup) ?? [], game),
    [region.versionGroup, game],
  );
  const items = useMemo(() => {
    const onMap = itemsFor(region.versionGroup) ?? [];
    const gifts = giftItems(npcsFor(region.versionGroup) ?? [], onMap, game.id);

    return [...onMap.filter(({ games }) => games.includes(game.id)), ...gifts];
  }, [region.versionGroup, game.id]);
  const npcs = useMemo(
    () =>
      npcsFor(region.versionGroup)?.filter(
        ({ special, item, games }) =>
          special && !item && games.includes(game.id),
      ) ?? [],
    [region.versionGroup, game.id],
  );

  return { entries, battles, items, npcs };
};
