import { useParams } from 'react-router';

import { type Game, getGame } from '@/data/games';
import {
  getLocationTrail,
  getRegion,
  type Location,
  type Region,
} from '@/data/maps';
import { locationHref } from '@/lib/paths';

export type GameRoute = {
  game: Game;
  region: Region;
  trail: Location[] | undefined;
  href: (path: string) => string;
};

export function useGameRoute(): GameRoute | undefined {
  const { gameId, '*': path = '' } = useParams();
  const game = getGame(gameId);
  const region = game && getRegion(game.region);
  if (!game || !region) return undefined;

  return {
    game,
    region,
    trail: path ? getLocationTrail(region, path) : [],
    href: (locationPath) => locationHref(game.id, locationPath),
  };
}
