import type { Game } from '@/data/games';
import { getLocationTrail, getRegion } from '@/data/maps';
import { gameHref, locationHref } from '@/lib/paths';

export const switchHref = (game: Game, path: string) => {
  const region = getRegion(game.region);

  return path && region && getLocationTrail(region, path)
    ? locationHref(game.id, path)
    : gameHref(game.id);
};
