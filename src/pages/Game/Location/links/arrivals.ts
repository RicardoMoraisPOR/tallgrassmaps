import {
  type Direction,
  getLocation,
  type Location,
  type LocationFloor,
  type LocationHotspot,
  type Region,
} from '@/data/maps';

export type Landing = {
  target: string;
  floor?: string;
  travel?: Direction;
  hole?: boolean;
  pad?: string;
};

export const arrivalKey = (via: string) => `arrival:${via}`;

export const padVia = (floor: string | undefined, tile: string) =>
  `pad:${floor ?? ''}:${tile}`;

export const withQuery = (
  base: string,
  query: Record<string, string | undefined>,
) => {
  const params = new URLSearchParams(
    Object.entries(query).flatMap(([key, value]) =>
      value ? [[key, value]] : [],
    ),
  ).toString();

  return params ? `${base}?${params}` : base;
};

export const returning = (
  hotspots: Array<LocationHotspot>,
  from: string | undefined,
) =>
  from
    ? hotspots.map((hotspot) =>
        hotspot.back ? { ...hotspot, floor: from } : hotspot,
      )
    : hotspots;

const landings = (
  location: Location,
  floor?: LocationFloor,
  from?: string,
): Array<Landing> => [
  ...returning(floor?.hotspots ?? location.hotspots, from),
  ...location.markers.flatMap(({ target }) => (target ? [{ target }] : [])),
];

export const arrivals = (
  region: Region,
  location: Location,
  floor?: LocationFloor,
  from?: string,
) => {
  const landingKey = ({ target, floor: to }: Landing) =>
    `${target}:${to ?? getLocation(region, target)?.floors?.[0]?.id ?? ''}`;
  const seen = new Map<string, number>();

  return landings(location, floor, from).map((landing) => {
    if (landing.hole || landing.pad)
      return { key: '', count: 0, marked: false };

    const key = landingKey(landing);
    const count = (seen.get(key) ?? 0) + 1;

    seen.set(key, count);

    return {
      key: `${key}:${count}`,
      count,
      marked: !landing.travel,
    };
  });
};
