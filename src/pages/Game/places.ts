import {
  getLocation,
  inGame,
  type Location,
  type LocationKind,
  type PlaceGroup,
  type PlaceGroups,
  type Region,
} from '@/data/maps';
import { joinPath } from '@/lib/paths';

export type Place = {
  path: string;
  location: Location;
};

export const defaultPlaceGroups: PlaceGroups = {
  groups: [
    {
      id: 'town',
      label: 'Towns',
      singular: 'Town',
      icon: 'square',
      kinds: ['town'],
    },
    {
      id: 'route',
      label: 'Routes',
      singular: 'Route',
      icon: 'line',
      kinds: ['route'],
    },
    {
      id: 'landmark',
      label: 'Landmarks',
      singular: 'Landmark',
      icon: 'circle',
      kinds: ['dungeon', 'building', 'landmark'],
    },
  ],
  legend: ['town', 'landmark', 'route'],
  search: 'Search towns, routes, caves…',
};

export const placeGroupsFor = (region: Region) =>
  region.placeGroups ?? defaultPlaceGroups;

export const groupOf = (
  { groups }: PlaceGroups,
  kind: LocationKind,
): PlaceGroup =>
  groups.find((group) => group.kinds.includes(kind)) ?? groups[0];

export const kindLabels: Record<LocationKind, string> = {
  town: 'Town',
  route: 'Route',
  dungeon: 'Cave & dungeon',
  building: 'Building',
  landmark: 'Landmark',
  'wild-zone': 'Wild Zone',
  sector: 'Sector Zone',
};

export const collectPlaces = (region: Region, gameId: string): Array<Place> => {
  const places = new Map<string, Location>();

  const add = (path: string, location: Location) => {
    if (!places.has(path)) places.set(path, location);
  };

  const addInside = (locations: Array<Location>, parentPath: string) => {
    for (const location of locations) {
      if (location.dataPath || !inGame(location, gameId)) continue;

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
