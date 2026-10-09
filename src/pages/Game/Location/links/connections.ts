import {
  type Direction,
  getLocation,
  type Location,
  type LocationFloor,
  type LocationHotspot,
  type Rect,
  type Region,
} from '@/data/maps';
import { pathSegments } from '@/lib/paths';

import { hotspotLayer } from '../mapLayers';
import {
  arrivalKey,
  arrivals,
  type Landing,
  padVia,
  returning,
  withQuery,
} from './arrivals';
import { floorLabel, floorName, floorStep } from './floors';
import type { LayeredMapLink } from './types';

type ConnectionContext = {
  region: Region;
  location: Location;
  path: string;
  href: (path: string) => string;
  floor?: LocationFloor;
  from?: string;
};

const edgeCenter = (
  { x, y, width, height }: Rect,
  direction: Direction,
  map: { width: number; height: number },
) => {
  if (direction === 'north') return { x: x + width / 2, y: 0 };
  if (direction === 'south') return { x: x + width / 2, y: map.height };
  if (direction === 'west') return { x: 0, y: y + height / 2 };

  return { x: map.width, y: y + height / 2 };
};

export const buildConnections = ({
  region,
  location,
  path,
  href,
  floor,
  from,
}: ConnectionContext) => {
  const hotspots = returning(floor?.hotspots ?? location.hotspots, from);
  const targetNames = [
    ...new Set(hotspots.map(({ target }) => getLocation(region, target))),
  ].flatMap((target) => (target ? [target.name] : []));
  const sharedNames = new Set(
    targetNames.filter((name, index) => targetNames.indexOf(name) !== index),
  );

  const placeName = (path: string, name: string) => {
    if (!sharedNames.has(name)) return name;

    const parent = getLocation(
      region,
      pathSegments(path).slice(0, -1).join('/'),
    );

    return parent ? `${name} (${parent.name})` : name;
  };

  const floorExitTotals = new Map<string, number>();
  const floorExitSeen = new Map<string, number>();

  for (const hotspot of hotspots)
    if (
      hotspot.floor &&
      hotspot.target === path &&
      !hotspot.hole &&
      !hotspot.travel &&
      !hotspot.pad
    )
      floorExitTotals.set(
        hotspot.floor,
        (floorExitTotals.get(hotspot.floor) ?? 0) + 1,
      );

  const floorExitLabel = (hotspot: LocationHotspot, target: Location) => {
    const floorId = hotspot.floor!;

    if (hotspot.hole) return { label: `Hole to ${floorName(target, floorId)}` };
    if (hotspot.travel)
      return { label: `${target.name} ${floorName(target, floorId)}` };
    const count = (floorExitSeen.get(floorId) ?? 0) + 1;

    floorExitSeen.set(floorId, count);

    const single = (floorExitTotals.get(floorId) ?? 0) === 1;

    if (single && !hotspot.door)
      return {
        label: floorLabel(target, floorStep(target, floor, floorId), floorId),
      };

    const kind = hotspot.door
      ? 'Door'
      : hotspot.ladder
        ? 'Ladder'
        : hotspot.current
          ? 'Current'
          : 'Stairs';

    if (single) return { label: `${kind} to ${floorName(target, floorId)}` };

    return { label: `${kind} #${count} to ${floorName(target, floorId)}` };
  };

  const here = arrivals(region, location, floor, from);

  const returnsHere = (target: string, to: string | undefined) =>
    target === path &&
    location.floors
      ?.find(({ id }) => id === to)
      ?.hotspots.some(({ back }) => back)
      ? floor?.id
      : undefined;
  const markedAt = new Map<string, Set<string>>();

  const arrivesMarked = ({ target, floor: to }: Landing, via: string) => {
    const destination = getLocation(region, target);

    if (!destination) return false;

    const destinationFloor =
      destination.floors?.find(({ id }) => id === to) ??
      destination.floors?.[0];
    const returnTo = returnsHere(target, destinationFloor?.id);
    const cacheKey = `${target}:${destinationFloor?.id ?? ''}:${returnTo ?? ''}`;

    if (!markedAt.has(cacheKey))
      markedAt.set(
        cacheKey,
        new Set(
          arrivals(region, destination, destinationFloor, returnTo).flatMap(
            ({ key, marked }) => (marked ? [key] : []),
          ),
        ),
      );

    return markedAt.get(cacheKey)!.has(via);
  };

  const pairing = (landing: Landing, index: number) => {
    const { key, count, marked } = here[index];

    if (landing.hole || landing.pad) return {};

    const via = `${path}:${floor?.id ?? ''}:${count}`;

    return {
      arrival: marked ? arrivalKey(key) : undefined,
      via: arrivesMarked(landing, via) ? via : undefined,
    };
  };

  const padTotals = new Map<string, number>();
  const padSeen = new Map<string, number>();

  for (const { pad, floor: to = '' } of hotspots)
    if (pad) padTotals.set(to, (padTotals.get(to) ?? 0) + 1);

  const padLink = (hotspot: LocationHotspot, target: Location) => {
    const to = hotspot.floor ?? '';
    const count = (padSeen.get(to) ?? 0) + 1;
    const number = (padTotals.get(to) ?? 0) > 1 ? ` #${count}` : '';
    const elsewhere =
      hotspot.floor && hotspot.floor !== floor?.id
        ? ` to ${floorName(target, hotspot.floor)}`
        : '';

    padSeen.set(to, count);

    return {
      href: withQuery(href(hotspot.target), {
        floor: hotspot.floor,
        via: padVia(hotspot.floor, hotspot.lands!),
      }),
      highlightKey: arrivalKey(padVia(floor?.id, hotspot.pad!)),
      label: `Teleporter${number}${elsewhere}`,
      replace: true,
      stairs: true,
      teleport: true,
    };
  };

  const hotspotLink = (hotspot: LocationHotspot, index: number) => {
    const target = getLocation(region, hotspot.target);

    if (!target) return undefined;
    if (hotspot.pad) return padLink(hotspot, target);

    const { arrival, via } = pairing(hotspot, index);
    const base = {
      href: withQuery(href(hotspot.target), {
        floor: hotspot.floor,
        via,
        from: returnsHere(hotspot.target, hotspot.floor),
      }),
      ...(arrival && { highlightKey: [href(hotspot.target), arrival] }),
    };

    if (!hotspot.floor || hotspot.target !== path)
      return { ...base, label: placeName(hotspot.target, target.name) };

    return {
      ...base,
      ...floorExitLabel(hotspot, target),
      step: hotspot.hole
        ? ('down' as const)
        : floorStep(target, floor, hotspot.floor),
      ...(arrival && { highlightKey: arrival }),
      replace: true,
      stairs: true,
    };
  };

  const links: Array<LayeredMapLink> = hotspots.flatMap((hotspot, index) => {
    const link = hotspotLink(hotspot, index);
    const layer = hotspotLayer(hotspot);

    return link
      ? [{ ...hotspot, ...link, layer: layer.id, className: layer.className }]
      : [];
  });

  return { links, pairing, hotspotCount: hotspots.length };
};

export const connectionIcons = (
  links: Array<LayeredMapLink>,
  map: { width: number; height: number },
): Array<LayeredMapLink> =>
  links.flatMap((link): Array<LayeredMapLink> => {
    if (link.layer !== 'connections') return [];

    const icon = { ...link, width: 0, height: 0 };

    if (!link.travel)
      return [
        {
          ...icon,
          x: link.x + link.width / 2,
          y: link.y + link.height / 2,
          icon: link.teleport
            ? { kind: 'teleport' as const }
            : link.door
              ? { kind: 'door' as const }
              : link.stairs
                ? {
                    kind: link.hole
                      ? ('hole' as const)
                      : link.ladder
                        ? ('ladder' as const)
                        : link.current
                          ? ('current' as const)
                          : ('stairs' as const),
                    step: link.step,
                  }
                : { kind: 'exit' as const },
        },
      ];

    return [
      {
        ...icon,
        ...edgeCenter(link, link.travel, map),
        icon: { kind: 'arrow' as const, direction: link.travel },
      },
    ];
  });
