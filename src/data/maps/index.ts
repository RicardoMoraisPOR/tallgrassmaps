import { pathSegments } from '@/lib/paths';

import { kantoRby } from './kanto-rby';
import { lumioseZa } from './lumiose-za';
import type { Location, Region } from './types';

export type * from './types';

export const regions: Array<Region> = [kantoRby, lumioseZa];

export const getRegion = (id: string) =>
  regions.find((region) => region.id === id);

export const getLocationTrail = (
  region: Region,
  path: string,
): Array<Location> | undefined => {
  const trail: Array<Location> = [];
  let children = region.locations;

  for (const id of pathSegments(path)) {
    const location = children.find((child) => child.id === id);

    if (!location) return undefined;

    trail.push(location);
    children = location.locations;
  }

  return trail.length > 0 ? trail : undefined;
};

export const getLocation = (region: Region, path: string) =>
  getLocationTrail(region, path)?.at(-1);

export const inGame = ({ games }: { games?: Array<string> }, gameId: string) =>
  !games || games.includes(gameId);

export const locationInGame = (
  location: Location,
  gameId: string,
): Location => ({
  ...location,
  hotspots: location.hotspots.filter((hotspot) => inGame(hotspot, gameId)),
  markers: location.markers.filter((marker) => inGame(marker, gameId)),
  locations: location.locations.filter((child) => inGame(child, gameId)),
});

export const getHotspot = (region: Region, target: string) =>
  region.hotspots.find((hotspot) => hotspot.target === target);
