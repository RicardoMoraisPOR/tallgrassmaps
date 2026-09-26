import type { MapLink } from '@/components/map/MapViewer';
import type { MapItem } from '@/data/items/types';
import {
  getLocation,
  type Location,
  type LocationFloor,
  type LocationHotspot,
  type Region,
} from '@/data/maps';
import { joinPath } from '@/lib/paths';

import type { PlaceLink } from './MapInfoCard';
import {
  hotspotLayer,
  itemLayer,
  type MapLayerId,
  markerLayer,
} from './mapLayers';

export type LayeredMapLink = MapLink & { layer: MapLayerId };

const floorLabel = (
  location: Location,
  from: LocationFloor | undefined,
  to: string,
) => {
  const floors = location.floors ?? [];
  const index = (id?: string) => floors.findIndex((entry) => entry.id === id);
  const name = floors[index(to)]?.name ?? to;

  return `${index(to) > index(from?.id) ? 'Up' : 'Down'} to ${name}`;
};

export const locationLinks = (
  region: Region,
  location: Location,
  path: string,
  href: (path: string) => string,
  floor?: LocationFloor,
  items: Array<MapItem> = [],
) => {
  const hotspotLink = (hotspot: LocationHotspot) => {
    const target = getLocation(region, hotspot.target);

    if (!target) return undefined;
    if (!hotspot.floor)
      return { href: href(hotspot.target), label: target.name };

    return {
      href: `${href(hotspot.target)}?floor=${hotspot.floor}`,
      label: floorLabel(target, floor, hotspot.floor),
      replace: true,
    };
  };

  const links: Array<LayeredMapLink> = (
    floor?.hotspots ?? location.hotspots
  ).flatMap((hotspot) => {
    const link = hotspotLink(hotspot);
    const layer = hotspotLayer(hotspot);

    return link
      ? [{ ...hotspot, ...link, layer: layer.id, className: layer.className }]
      : [];
  });

  const markers: Array<LayeredMapLink> = location.markers.map(
    ({ kind, name, ...area }) => {
      const layer = markerLayer(kind);

      return {
        ...area,
        label: name,
        layer: layer.id,
        className: layer.className,
      };
    },
  );

  const itemMarkers: Array<LayeredMapLink> = items.map((item) => {
    const layer = itemLayer(item.hidden);

    return {
      x: item.x * 16 - 4,
      y: item.y * 16 - 4,
      width: 24,
      height: 24,
      label: item.hidden ? `${item.item} (hidden)` : item.item,
      layer: layer.id,
      className: layer.className,
    };
  });

  const placeLinks = (layer: MapLayerId, initial: Array<PlaceLink> = []) => {
    const places = new Map(initial.map((link) => [link.href, link]));

    for (const link of links) {
      if (link.href && link.layer === layer && !places.has(link.href)) {
        places.set(link.href, {
          href: link.href,
          name: link.label,
          travel: link.travel,
          replace: link.replace,
        });
      }
    }

    return [...places.values()];
  };

  const inside = location.locations.map((child) => ({
    href: href(joinPath(path, child.id)),
    name: child.name,
  }));

  return {
    links: [...links, ...markers, ...itemMarkers],
    connections: placeLinks('connections'),
    entrances: placeLinks('entrances', inside),
  };
};
