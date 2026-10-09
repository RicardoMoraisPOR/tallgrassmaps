import connectionData from '../kanto-rby-connections.json';
import type {
  Direction,
  Location,
  LocationHotspot,
  LocationKind,
  Rect,
} from '../types';
import { type FloorExit, type InsideEntry, padFields } from './entries';
import { IMAGE_DIR, rect, type Size, sourceFor } from './helpers';
import { inside } from './inside';
import { outdoor } from './outdoor';
import { services } from './services';

type Connection = { to: string; direction: Direction; area: Rect };

const connections = connectionData as Partial<
  Record<string, Array<Connection>>
>;

const exitTarget = (exit: FloorExit) => ('to' in exit ? exit.to : exit.floor);

const overlaps = (a: Rect, b: Rect) =>
  a.x < b.x + b.width &&
  b.x < a.x + a.width &&
  a.y < b.y + b.height &&
  b.y < a.y + a.height;

const bounds = (a: Rect, b: Rect): Rect => {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);

  return rect(
    x,
    y,
    Math.max(a.x + a.width, b.x + b.width) - x,
    Math.max(a.y + a.height, b.y + b.height) - y,
  );
};

const mergeHoles = (exits: Array<FloorExit>): Array<FloorExit> => {
  const merged: Array<FloorExit> = [];

  for (const exit of exits) {
    let current = exit;
    const touching = (other: FloorExit) =>
      Boolean(current.hole && other.hole) &&
      exitTarget(other) === exitTarget(current) &&
      overlaps(other.area, current.area);

    for (let index = merged.findIndex(touching); index >= 0;) {
      const [other] = merged.splice(index, 1);

      current = { ...other, area: bounds(other.area, current.area) };
      index = merged.findIndex(touching);
    }

    merged.push(current);
  }

  return merged;
};

const toLocation = (
  id: string,
  name: string,
  kind: LocationKind,
  [width, height]: Size,
): Location => ({
  id,
  name,
  kind,
  image: `${IMAGE_DIR}/${id}.png`,
  width,
  height,
  pixelated: true,
  source: sourceFor(`${id}.png`),
  locations: [],
  hotspots: [],
  markers: [],
});

const floorId = (name: string) =>
  name
    .toLowerCase()
    .replaceAll(' ', '-')
    .replace(/[^a-z0-9-]/g, '');

const floorFile = (id: string, floor: string) => `${id}/${floorId(floor)}.png`;

const floorImage = (id: string, floor: string) =>
  `${IMAGE_DIR}/${floorFile(id, floor)}`;

const toInsideLocation = ({
  id,
  name,
  kind,
  size,
  parent,
  exits = [],
  floors,
  variants,
  games,
}: InsideEntry): Location => {
  const location = {
    ...toLocation(id, name, kind, size),
    variants,
    ...(games && { games }),
    hotspots: exits.map((exit) => ({
      ...('area' in exit ? exit.area : exit),
      kind: 'exit' as const,
      target:
        'to' in exit ? exit.to : 'pad' in exit ? `${parent}/${id}` : parent,
      ...('pad' in exit && padFields(exit)),
    })),
  };

  if (!floors) return location;

  return {
    ...location,
    image: floorImage(id, floors[0].name),
    source: sourceFor(floorFile(id, floors[0].name)),
    floors: floors.map((floor) => ({
      id: floorId(floor.name),
      name: floor.name,
      image: floorImage(id, floor.name),
      hotspots: mergeHoles(floor.exits ?? []).map(
        ({
          area,
          pad,
          lands,
          back,
          travel,
          ladder,
          hole,
          current,
          door,
          ...exit
        }) => ({
          ...area,
          ...(pad && lands && padFields({ area, pad, lands })),
          ...(back && { back }),
          ...(travel && { travel }),
          ...(ladder && { ladder }),
          ...(hole && { hole }),
          ...(current && { current }),
          ...(door && { door }),
          kind: 'exit' as const,
          ...('to' in exit
            ? { target: exit.to }
            : { target: `${parent}/${id}`, floor: floorId(exit.floor) }),
        }),
      ),
      width: floor.size?.[0] ?? location.width,
      height: floor.size?.[1] ?? location.height,
      variants: floor.variants,
      ...(floor.games && { games: floor.games }),
      pixelated: location.pixelated,
      source: sourceFor(floorFile(id, floor.name)),
    })),
  };
};

const buildings = [...inside, ...services];

const hotspotsFor = (mapId: string): Array<LocationHotspot> => [
  ...inside.flatMap(({ id, parent, entrances, otherEntrances, games }) => {
    const rects =
      mapId === parent ? entrances : (otherEntrances?.[mapId] ?? []);

    return rects.map((entry) => ({
      ...('floor' in entry
        ? { ...entry.area, floor: floorId(entry.floor) }
        : entry),
      kind: 'entrance' as const,
      target: `${parent}/${id}`,
      ...(games && { games }),
    }));
  }),
  ...(connections[mapId] ?? []).map(({ to, direction, area }) => ({
    ...area,
    kind: 'exit' as const,
    target: to,
    travel: direction,
  })),
];

export const locations: Array<Location> = outdoor.map(
  ({ id, name, kind, size, variants }) => ({
    ...toLocation(id, name, kind, size),
    markers: services.flatMap((building) =>
      (building.parent === id
        ? building.entrances
        : (building.otherEntrances?.[id] ?? [])
      ).map((entry) => ({
        ...('area' in entry ? entry.area : entry),
        kind: building.marker ?? 'house',
        name: building.name,
        target: `${id}/${building.id}`,
        ...(building.games && { games: building.games }),
      })),
    ),
    variants,
    locations: buildings
      .filter(
        ({ parent, otherParents = [] }) =>
          parent === id || otherParents.includes(id),
      )
      .map((building) =>
        building.parent === id
          ? toInsideLocation(building)
          : {
              ...toInsideLocation(building),
              dataPath: `${building.parent}/${building.id}`,
            },
      ),
    hotspots: hotspotsFor(id),
  }),
);
