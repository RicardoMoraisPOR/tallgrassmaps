import {
  getLocation,
  type Location,
  type LocationKind,
  type Region,
} from '@/data/maps';
import { joinPath } from '@/lib/paths';

export type Place = {
  path: string;
  location: Location;
};

export type PlaceGroup = 'town' | 'route' | 'landmark';

export const placeGroup = (kind: LocationKind): PlaceGroup =>
  kind === 'town' || kind === 'route' ? kind : 'landmark';

export const kindLabels: Record<LocationKind, string> = {
  town: 'Town',
  route: 'Route',
  dungeon: 'Cave & dungeon',
  building: 'Building',
};

export const collectPlaces = (region: Region): Array<Place> => {
  const places = new Map<string, Location>();

  const add = (path: string, location: Location) => {
    if (!places.has(path)) places.set(path, location);
  };

  const addInside = (locations: Array<Location>, parentPath: string) => {
    for (const location of locations) {
      if (location.dataPath) continue;

      const path = joinPath(parentPath, location.id);

      add(path, location);
      addInside(location.locations, path);
    }
  };

  for (const { target } of region.hotspots) {
    const location = getLocation(region, target);

    if (location) add(target, location);
  }

  for (const location of region.locations) {
    addInside(location.locations, location.id);
  }

  return [...places].map(([path, location]) => ({ path, location }));
};
