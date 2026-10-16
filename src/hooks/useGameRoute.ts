import { useParams } from 'react-router';

import { type Game, getGame, regionIdsOf } from '@/data/games';
import {
  getLocationTrail,
  getRegion,
  type Location,
  type Region,
  regionHref,
  regionSlug,
} from '@/data/maps';
import { joinPath, pathSegments } from '@/lib/paths';
import { useSettingsStore } from '@/stores/settings';

export type GameRoute = {
  game: Game;
  region: Region;
  regions: Array<Region>;
  trail: Array<Location> | undefined;
  hub: boolean;
  onMap: boolean;
  worldShown: boolean;
  legacyPath: string | undefined;
  href: (path: string) => string;
};

export const useGameRoute = (): GameRoute | undefined => {
  const { gameId, '*': path = '' } = useParams();
  const worldPreferred = useSettingsStore((state) => state.worldView);

  const game = getGame(gameId);
  const regions = game
    ? regionIdsOf(game).flatMap((id) => getRegion(id) ?? [])
    : [];
  const [first, ...rest] = pathSegments(path);
  const region =
    regions.find((candidate) => regionSlug(candidate) === first) ?? regions[0];

  if (!game || !region) return undefined;

  const hub = !first;
  const onMap = first === regionSlug(region);
  const placePath = onMap ? joinPath(...rest) : '';
  const trail = placePath ? getLocationTrail(region, placePath) : [];
  const legacyPath = !hub && !onMap ? path : undefined;
  const worldShown =
    onMap &&
    Boolean(region.world) &&
    (trail?.length === 0 ||
      (trail?.length === 1 &&
        Boolean(region.world?.[trail[0].id]) &&
        worldPreferred));

  return {
    game,
    region,
    regions,
    trail,
    hub,
    onMap,
    worldShown: Boolean(worldShown),
    legacyPath,
    href: (locationPath) => regionHref(game.id, region, locationPath),
  };
};
