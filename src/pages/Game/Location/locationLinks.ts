import type { ReactNode } from 'react';

import type { MapLink } from '@/components/map/MapViewer';
import type { MapItem } from '@/data/items/types';
import {
  type Direction,
  getLocation,
  type Location,
  type LocationFloor,
  type LocationHotspot,
  type Rect,
  type Region,
  type WildArea,
} from '@/data/maps';
import type { MapNpc } from '@/data/npcs/types';
import type { MapSign } from '@/data/signs/types';
import type { StaticPokemon } from '@/data/static-pokemon/types';
import { joinPath } from '@/lib/paths';
import { cn } from '@/lib/utils';

import { staticHighlightKey, wildHighlightKey } from './encounters';
import type { PlaceLink } from './MapInfoTab';
import {
  connectionArrowLayer,
  entranceIconLayer,
  hotspotLayer,
  itemLayer,
  type MapLayerId,
  markerLayer,
  npcLayer,
  signLayer,
  staticLayer,
  trainerLayer,
  wildLayer,
} from './mapLayers';
import type { ListedBattle } from './trainerList';

const ICON_PREVIEW_PLACES = [
  'pallet-town',
  'pallet-town/oaks-lab',
  'pallet-town/reds-house',
  'pallet-town/blues-house',
  'route-1',
  'viridian-city',
  'viridian-city/viridian-pokemon-center',
  'viridian-city/viridian-poke-mart',
  'viridian-city/viridian-gym',
  'viridian-city/viridian-school-house',
  'viridian-city/viridian-nickname-house',
];

const TILE_PIXELS = 16;
const DEFAULT_SPRITE_OFFSET = [0, -4];

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

export type LayeredMapLink = MapLink & {
  layer: MapLayerId;
  stairs?: boolean;
};

type MarkerSources = {
  items?: Array<MapItem>;
  trainers?: Array<ListedBattle>;
  onSelectTrainer?: (key: string) => void;
  trainerTooltip?: (group: Array<ListedBattle>) => ReactNode;
  npcs?: Array<MapNpc>;
  npcTooltip?: (npc: MapNpc) => ReactNode;
  signs?: Array<MapSign>;
  signTooltip?: (sign: MapSign) => ReactNode;
  onOpen?: (target: NonNullable<MapSign['opens']>) => void;
  wildAreas?: Array<WildArea>;
  wildPopup?: (method: WildArea['method']) => ReactNode;
  staticPokemon?: Array<StaticPokemon>;
  staticPopup?: (pokemon: StaticPokemon) => ReactNode;
};

type FloorStep = 'up' | 'down';

const floorStep = (
  location: Location,
  from: LocationFloor | undefined,
  to: string,
): FloorStep => {
  const floors = location.floors ?? [];
  const index = (id?: string) => floors.findIndex((entry) => entry.id === id);

  return index(to) > index(from?.id) ? 'up' : 'down';
};

const floorLabel = (location: Location, step: FloorStep, to: string) => {
  const name = location.floors?.find((entry) => entry.id === to)?.name ?? to;

  return `${step === 'up' ? 'Up' : 'Down'} to ${name}`;
};

export const locationLinks = (
  region: Region,
  location: Location,
  path: string,
  href: (path: string) => string,
  tileSize = 1,
  floor?: LocationFloor,
  {
    items = [],
    trainers = [],
    onSelectTrainer,
    trainerTooltip,
    npcs = [],
    npcTooltip,
    signs = [],
    signTooltip,
    onOpen,
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
      label: floorLabel(
        target,
        floorStep(target, floor, hotspot.floor),
        hotspot.floor,
      ),
      replace: true,
      stairs: true,
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

  const arrowLayer = connectionArrowLayer();
  const connectionArrows: Array<LayeredMapLink> = ICON_PREVIEW_PLACES.includes(
    path,
  )
    ? links.flatMap((link): Array<LayeredMapLink> => {
        if (link.layer !== 'connections') return [];

        const icon = {
          ...link,
          width: 0,
          height: 0,
          layer: arrowLayer.id,
          className: arrowLayer.className,
        };

        if (!link.travel)
          return [
            {
              ...icon,
              x: link.x + link.width / 2,
              y: link.y + link.height / 2,
              icon: {
                kind: link.stairs ? ('stairs' as const) : ('exit' as const),
              },
            },
          ];

        return [
          {
            ...icon,
            ...edgeCenter(link, link.travel, location),
            icon: { kind: 'arrow' as const, direction: link.travel },
          },
        ];
      })
    : [];

  const entranceLayer = entranceIconLayer();
  const entranceIcons: Array<LayeredMapLink> = ICON_PREVIEW_PLACES.includes(
    path,
  )
    ? links.flatMap((link) => {
        if (link.layer !== 'entrances') return [];

        return [
          {
            ...link,
            x: link.x + link.width / 2,
            y: link.y + link.height / 2,
            width: 0,
            height: 0,
            layer: entranceLayer.id,
            className: entranceLayer.className,
            icon: { kind: 'door' as const },
          },
        ];
      })
    : [];

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

  const markerLinks: Array<LayeredMapLink> = ICON_PREVIEW_PLACES.includes(path)
    ? markers.map((marker) => ({
        ...marker,
        x: marker.x + marker.width / 2,
        y: marker.y + marker.height / 2,
        width: 0,
        height: 0,
        icon: { kind: 'door' as const },
      }))
    : markers;

  const itemMarkers: Array<LayeredMapLink> = items.map((item) => {
    const layer = itemLayer(item.hidden);

    const common = {
      label: item.hidden ? `${item.item} (hidden)` : item.item,
      layer: layer.id,
      className: layer.className,
    };

    if (item.sprite) {
      return {
        ...common,
        x: item.x * tileSize,
        y: item.y * tileSize - tileSize / 4,
        width: tileSize,
        height: tileSize,
        sprite: {
          src: item.sprite,
          facing: 'down' as const,
          faded: item.hidden,
        },
      };
    }

    return {
      ...common,
      x: item.x * tileSize - tileSize / 4,
      y: item.y * tileSize - tileSize / 4,
      width: tileSize * 1.5,
      height: tileSize * 1.5,
    };
  });

  const trainersByTile = new Map<string, Array<ListedBattle>>();

  for (const listed of trainers) {
    const { x, y } = listed.battle;

    if (x === undefined || y === undefined) continue;

    const tile = `${x},${y}`;

    trainersByTile.set(tile, [...(trainersByTile.get(tile) ?? []), listed]);
  }

  const trainerMarkers: Array<LayeredMapLink> = [
    ...trainersByTile.values(),
  ].map((group) => {
    const [{ battle, key, label }] = group;
    const x = battle.x ?? 0;
    const y = battle.y ?? 0;

    const layer = trainerLayer();

    const common = {
      label,
      layer: layer.id,
      className: layer.className,
      highlightKey: group.map((listed) => listed.key),
      onClick: onSelectTrainer && (() => onSelectTrainer(key)),
      tooltip: trainerTooltip?.(group),
    };

    if (battle.sprite) {
      return {
        ...common,
        x: x * tileSize,
        y: y * tileSize - tileSize / 4,
        width: tileSize,
        height: tileSize,
        sprite: {
          src: battle.sprite,
          facing: battle.facing ?? 'down',
          faded: battle.cutscene,
        },
      };
    }

    return {
      ...common,
      x: x * tileSize - tileSize / 4,
      y: y * tileSize - tileSize / 4,
      width: tileSize * 1.5,
      height: tileSize * 1.5,
    };
  });

  const npcMarkers: Array<LayeredMapLink> = npcs.map((npc) => {
    const layer = npcLayer();
    const [offsetX, offsetY] = npc.spriteOffset ?? DEFAULT_SPRITE_OFFSET;

    return {
      x: (npc.x + offsetX / TILE_PIXELS) * tileSize,
      y: (npc.y + offsetY / TILE_PIXELS) * tileSize,
      width: tileSize,
      height: tileSize,
      label: npc.name,
      layer: layer.id,
      className: layer.className,
      tooltip: npcTooltip?.(npc),
      tooltipOnClick: true,
      sprite: {
        src: npc.sprite,
        facing: npc.facing,
        faded: npc.cutscene,
      },
    };
  });

  const signMarkers: Array<LayeredMapLink> = signs.map((sign) => {
    if (sign.sprite) {
      const { opens } = sign;
      const layer = opens ? itemLayer(false) : signLayer();

      return {
        x: sign.x * tileSize,
        y: sign.y * tileSize - tileSize / 4,
        width: tileSize,
        height: tileSize,
        label: sign.text,
        layer: layer.id,
        className: layer.className,
        tooltip: signTooltip?.(sign),
        tooltipOnClick: !opens,
        onClick: opens && onOpen && (() => onOpen(opens)),
        sprite: { src: sign.sprite, facing: 'down' as const },
      };
    }

    const layer = signLayer();

    return {
      x: sign.x * tileSize + tileSize / 2,
      y: sign.y * tileSize + tileSize / 2,
      width: 0,
      height: 0,
      label: sign.text,
      layer: layer.id,
      className: layer.className,
      tooltip: signTooltip?.(sign),
      tooltipOnClick: true,
      icon: { kind: 'sign' as const },
    };
  });

  const staticMarkers: Array<LayeredMapLink> = staticPokemon.map((marker) => {
    const layer = staticLayer();

    const common = {
      label: marker.kind === 'gift' ? 'Gift Pokémon' : 'Static Pokémon',
      layer: layer.id,
      className: layer.className,
      highlightKey: marker.pokemon.map(({ number }) =>
        staticHighlightKey(number),
      ),
      popup: staticPopup?.(marker),
    };

    if (marker.sprite) {
      return {
        ...common,
        x: marker.x * tileSize,
        y: marker.y * tileSize - tileSize / 4,
        width: tileSize,
        height: tileSize,
        sprite: { src: marker.sprite, facing: 'down' as const },
      };
    }

    return {
      ...common,
      x: marker.x * tileSize - tileSize / 4,
      y: marker.y * tileSize - tileSize / 4,
      width: tileSize * 1.5,
      height: tileSize * 1.5,
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
        tooltip: wildPopup?.(method),
        tooltipOnClick: true,
        tooltipAtClick: true,
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
      ...connectionArrows,
      ...entranceIcons,
      ...markerLinks,
      ...itemMarkers,
      ...staticMarkers,
      ...trainerMarkers,
      ...npcMarkers,
      ...signMarkers,
    ],
    connections: placeLinks('connections'),
    entrances: placeLinks('entrances', inside),
  };
};
