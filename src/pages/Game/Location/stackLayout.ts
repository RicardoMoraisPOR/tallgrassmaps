import type { MapLink } from '@/components/map/viewer/types';
import type { LocationFloor } from '@/data/maps';

const GAP_PIXELS = 56;
const ROOF_LEVEL = 1000;

export type StackedFloor = {
  id: string;
  name: string;
  image: string;
  pixelated: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
};

const level = (name: string) => {
  const basement = /^B(\d+)F$/.exec(name);
  const upper = /^(\d+)F$/.exec(name);

  if (basement) return -Number(basement[1]);
  if (upper) return Number(upper[1]);
  if (name === 'Roof') return ROOF_LEVEL;

  return undefined;
};

export const stackOrder = (floors: Array<LocationFloor>) => {
  const known = floors
    .filter(({ name }) => level(name) !== undefined)
    .toSorted((a, b) => (level(b.name) ?? 0) - (level(a.name) ?? 0));
  const unknown = floors.filter(({ name }) => level(name) === undefined);

  return [...known, ...unknown];
};

export const stackFloors = (
  floors: Array<LocationFloor>,
  imageOf: (floor: LocationFloor) => string,
) => {
  const ordered = stackOrder(floors);
  const width = Math.max(...ordered.map((floor) => floor.width));
  let top = 0;

  const placed = ordered.map<StackedFloor>((floor) => {
    const entry = {
      id: floor.id,
      name: floor.name,
      image: imageOf(floor),
      pixelated: floor.pixelated,
      x: (width - floor.width) / 2,
      y: top,
      width: floor.width,
      height: floor.height,
    };

    top += floor.height + GAP_PIXELS;

    return entry;
  });

  return { floors: placed, width, height: top - GAP_PIXELS };
};

export const offsetLink = <T extends MapLink>(
  link: T,
  dx: number,
  dy: number,
): T => ({
  ...link,
  x: link.x + dx,
  y: link.y + dy,
  outline: link.outline?.map((polygon) =>
    polygon.map(([x, y]): [number, number] => [x + dx, y + dy]),
  ),
});

export const stackedHref = (href: string | undefined) =>
  href && !href.includes('floors=')
    ? `${href}${href.includes('?') ? '&' : '?'}floors=all`
    : href;
