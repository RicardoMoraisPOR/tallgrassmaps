import type { Game } from '@/data/games';
import { getLocationTrail, getRegion, inGame } from '@/data/maps';
import { gameHref, joinPath, locationHref, pathSegments } from '@/lib/paths';

const FLOOR_PARAM = 'floor';

const keptSearch = (search: string, floorExists: boolean) => {
  const params = new URLSearchParams(search);

  if (!floorExists) params.delete(FLOOR_PARAM);

  const query = params.toString();

  return query ? `?${query}` : '';
};

export const switchHref = (game: Game, path: string, search = '') => {
  const region = getRegion(game.region);
  const segments = pathSegments(path);

  if (!region) return gameHref(game.id);

  for (let length = segments.length; length > 0; length--) {
    const trail = getLocationTrail(
      region,
      joinPath(...segments.slice(0, length)),
    );

    if (!trail || !trail.every((location) => inGame(location, game.id)))
      continue;

    const href = locationHref(game.id, joinPath(...segments.slice(0, length)));

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
