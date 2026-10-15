import type { Game } from '@/data/games';
import {
  getLocationTrail,
  getRegion,
  inGame,
  regionHref,
} from '@/data/maps';
import { gameHref, joinPath, pathSegments } from '@/lib/paths';

const FLOOR_PARAM = 'floor';

const keptSearch = (search: string, floorExists: boolean) => {
  const params = new URLSearchParams(search);

  if (!floorExists) params.delete(FLOOR_PARAM);

  const query = params.toString();

  return query ? `?${query}` : '';
};

export const switchHref = (
  game: Game,
  path: string,
  search = '',
  hub = false,
) => {
  const region = getRegion(game.region);
  const segments = pathSegments(path);

  if (!region) return gameHref(game.id);
  if (!path) return hub ? gameHref(game.id) : regionHref(game.id, region);

  for (let length = segments.length; length > 0; length--) {
    const trail = getLocationTrail(
      region,
      joinPath(...segments.slice(0, length)),
    );

    if (!trail || !trail.every((location) => inGame(location, game.id)))
      continue;

    const href = regionHref(
      game.id,
      region,
      joinPath(...segments.slice(0, length)),
    );

    if (length < segments.length) return href;

    const floor = new URLSearchParams(search).get(FLOOR_PARAM);
    const floorExists = trail
      .at(-1)
      ?.floors?.some(
        (candidate) => candidate.id === floor && inGame(candidate, game.id),
      );

    return `${href}${keptSearch(search, Boolean(floorExists))}`;
  }

  return gameHref(game.id);
};
