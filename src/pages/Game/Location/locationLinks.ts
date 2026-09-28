import type { ReactNode } from 'react';

import type { MapLink } from '@/components/map/MapViewer';
import type { MapItem } from '@/data/items/types';
import {
  getLocation,
  type Location,
  type LocationFloor,
  type LocationHotspot,
  type Region,
  type WildArea,
} from '@/data/maps';
import type { StaticPokemon } from '@/data/static-pokemon/types';
import { joinPath } from '@/lib/paths';
import { cn } from '@/lib/utils';

import { staticHighlightKey, wildHighlightKey } from './encounters';
import type { PlaceLink } from './MapInfoTab';
import {
  hotspotLayer,
  itemLayer,
  type MapLayerId,
  markerLayer,
  staticLayer,
  trainerLayer,
  wildLayer,
} from './mapLayers';
import type { ListedBattle } from './trainerList';

export type LayeredMapLink = MapLink & { layer: MapLayerId };

type MarkerSources = {
  items?: Array<MapItem>;
  trainers?: Array<ListedBattle>;
  onSelectTrainer?: (key: string) => void;
  wildAreas?: Array<WildArea>;
  wildPopup?: (method: WildArea['method']) => ReactNode;
  staticPokemon?: Array<StaticPokemon>;
  staticPopup?: (pokemon: StaticPokemon) => ReactNode;
};

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
  tileSize: number,
  floor?: LocationFloor,
  {
    items = [],
    trainers = [],
    onSelectTrainer,
    wildAreas = [],
    wildPopup,
    staticPokemon = [],
    staticPopup,
  }: MarkerSources = {},
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
    ({ kind, name, target, ...area }) => {
      const layer = markerLayer(kind);

      return {
        ...area,
        href: target && href(target),
        label: name,
        layer: layer.id,
        className: layer.className,
      };
    },
  );

  const itemMarkers: Array<LayeredMapLink> = items.map((item) => {
    const layer = itemLayer(item.hidden);

    return {
      x: item.x * tileSize - tileSize / 4,
      y: item.y * tileSize - tileSize / 4,
      width: tileSize * 1.5,
      height: tileSize * 1.5,
      label: item.hidden ? `${item.item} (hidden)` : item.item,
      layer: layer.id,
      className: layer.className,
    };
  });

  const trainerMarkers: Array<LayeredMapLink> = trainers.flatMap(
    ({ battle, key, label }) => {
      if (battle.x === undefined || battle.y === undefined) return [];

      const layer = trainerLayer();

      return [
        {
          x: battle.x * tileSize - tileSize / 4,
          y: battle.y * tileSize - tileSize / 4,
          width: tileSize * 1.5,
          height: tileSize * 1.5,
          label,
          layer: layer.id,
          className: layer.className,
          highlightKey: key,
          onClick: onSelectTrainer && (() => onSelectTrainer(key)),
        },
      ];
    },
  );

  const staticMarkers: Array<LayeredMapLink> = staticPokemon.map((marker) => {
    const layer = staticLayer();

    return {
      x: marker.x * tileSize - tileSize / 4,
      y: marker.y * tileSize - tileSize / 4,
      width: tileSize * 1.5,
      height: tileSize * 1.5,
      label: marker.kind === 'gift' ? 'Gift Pokémon' : 'Static Pokémon',
      layer: layer.id,
      className: layer.className,
      highlightKey: marker.pokemon.map(({ number }) =>
        staticHighlightKey(number),
      ),
      popup: staticPopup?.(marker),
    };
  });

  const image = floor ?? location;
  const wildMarkers: Array<LayeredMapLink> = wildAreas.map(
    ({ method, whole, outline = [] }) => {
      const layer = wildLayer();
      const scaled = outline.map((ring) =>
        ring.map(([x, y]): [number, number] => [x * tileSize, y * tileSize]),
      );
      const xs = scaled.flat().map(([x]) => x);
      const ys = scaled.flat().map(([, y]) => y);
      const bounds =
        scaled.length === 0
          ? { x: 0, y: 0, width: image.width, height: image.height }
          : {
              x: Math.min(...xs),
              y: Math.min(...ys),
              width: Math.max(...xs) - Math.min(...xs),
              height: Math.max(...ys) - Math.min(...ys),
            };

      return {
        ...bounds,
        ...(scaled.length > 0 && { outline: scaled }),
        label: method === 'water' ? 'Wild Pokémon (water)' : 'Wild Pokémon',
        layer: layer.id,
        className: cn(layer.className, whole && 'map-link-wild-whole'),
        highlightKey: wildHighlightKey(method),
        popup: wildPopup?.(method),
        behind: true,
      };
    },
  );

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
    links: [
      ...wildMarkers,
      ...links,
      ...markers,
      ...itemMarkers,
      ...staticMarkers,
      ...trainerMarkers,
    ],
    connections: placeLinks('connections'),
    entrances: placeLinks('entrances', inside),
  };
};
