import type { NavigateFunction } from 'react-router';

import type { MapLink } from '@/components/map/viewer/types';
import { getGame, regionIdsOf } from '@/data/games';
import { getRegion, regionSlug, worldRegions } from '@/data/maps';
import type { GameRoute } from '@/hooks/useGameRoute';

import type { LayeredMapLink } from '../Game/Location/links/types';
import { buildLocationView } from '../Game/Location/locationView';
import { offsetLink } from '../Game/Location/stackLayout';
import { pokedexLink } from '../Game/Pokedex/usePokedex';

export type WorldFloor = {
  id: string;
  image: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type WorldData = {
  floors: Array<WorldFloor>;
  links: Array<LayeredMapLink>;
  width: number;
  height: number;
};

const noop = () => undefined;

export const buildWorldData = (gameId: string): WorldData | undefined => {
  const game = getGame(gameId);

  if (!game) return undefined;

  const regions = regionIdsOf(game).flatMap((id) => getRegion(id) ?? []);
  const [region] = regions;

  if (!region) return undefined;

  const route: GameRoute = {
    game,
    region,
    regions,
    trail: undefined,
    hub: false,
    onMap: true,
    worldShown: true,
    legacyPath: undefined,
    href: (path) => `/${game.id}/${regionSlug(region)}/${path}`,
  };
  const worldRegionList = worldRegions(regions, region);
  const world = Object.assign(
    {},
    ...worldRegionList.map((entry) => entry.world),
  );
  const placed = worldRegionList
    .flatMap(({ locations }) => locations)
    .filter(({ id }) => world[id]);

  const floors = placed.map((location) => {
    const variant = location.variants?.find((entry) =>
      entry.games.includes(game.id),
    );

    return {
      id: location.id,
      image: variant?.image ?? location.image,
      x: world[location.id].x,
      y: world[location.id].y,
      width: location.width,
      height: location.height,
    };
  });

  const links = placed.flatMap((location) => {
    const built = buildLocationView(
      {
        route,
        location,
        trail: [location],
        dataPath: location.dataPath ?? location.id,
        navigate: noop as unknown as NavigateFunction,
        pokedexLink: pokedexLink(new URLSearchParams()),
        openTownMap: noop,
        openShop: noop,
        selectTrainer: noop,
      },
      undefined,
    );
    const at = world[location.id];

    return built.links.map((link: MapLink & LayeredMapLink) =>
      offsetLink(link, at.x, at.y),
    );
  });

  return {
    floors,
    links,
    width: Math.max(...floors.map(({ x, width }) => x + width)),
    height: Math.max(...floors.map(({ y, height }) => y + height)),
  };
};
