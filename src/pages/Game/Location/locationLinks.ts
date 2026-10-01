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
import { joinPath, pathSegments } from '@/lib/paths';
import { cn } from '@/lib/utils';

import {
  staticHighlightKey,
  tradeHighlightKey,
  wildHighlightKey,
} from './encounters';
import {
  hotspotLayer,
  itemLayer,
  type MapLayer,
  type MapLayerId,
  mapLayers,
  markerLayer,
  npcLayer,
  signLayer,
  staticLayer,
  trainerLayer,
  wildLayer,
} from './mapLayers';
import type { ListedBattle } from './trainerList';

export const openableNames: Record<NonNullable<MapSign['opens']>, string> = {
  pokedex: 'Pokédex',
  'town-map': 'Town Map',
};

const PANEL_SECTIONS: Array<{
  id: LayerSection['id'];
  layers: Array<MapLayerId>;
}> = [
  {
    id: 'interactions',
    layers: ['items', 'hidden-items', 'static-pokemon', 'special-npcs', 'npcs'],
  },
  { id: 'exits', layers: ['connections', 'buildings', 'services'] },
];

const entryKey = (layer: MapLayerId, name: string) => `${layer}:${name}`;

export type LayerEntry = {
  key: string;
  name: string;
  href?: string;
  travel?: Direction;
  replace?: boolean;
  opens?: boolean;
};

export type LayerGroup = {
  layer: MapLayer;
  entries: Array<LayerEntry>;
};

export type LayerSection = {
  id: 'interactions' | 'exits';
  groups: Array<LayerGroup>;
};

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
  itemTooltip?: (item: MapItem) => ReactNode;
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
    itemTooltip,
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
  const hotspots = floor?.hotspots ?? location.hotspots;
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

  const hotspotLink = (hotspot: LocationHotspot) => {
    const target = getLocation(region, hotspot.target);

    if (!target) return undefined;
    if (!hotspot.floor)
      return {
        href: href(hotspot.target),
        label: placeName(hotspot.target, target.name),
      };

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

  const links: Array<LayeredMapLink> = hotspots.flatMap((hotspot) => {
    const link = hotspotLink(hotspot);
    const layer = hotspotLayer(hotspot);

    return link
      ? [{ ...hotspot, ...link, layer: layer.id, className: layer.className }]
      : [];
  });

  const connectionIcons: Array<LayeredMapLink> = links.flatMap(
    (link): Array<LayeredMapLink> => {
      if (link.layer !== 'connections') return [];

      const icon = { ...link, width: 0, height: 0 };

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
    },
  );

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

  const buildingIcons: Array<LayeredMapLink> = [
    ...links.filter((link) => link.layer === 'buildings'),
    ...markers,
  ].map((link) => ({
    ...link,
    x: link.x + link.width / 2,
    y: link.y + link.height / 2,
    width: 0,
    height: 0,
    icon: { kind: 'door' as const },
  }));

  const itemMarkers: Array<LayeredMapLink> = items.map((item) => {
    const layer = itemLayer(item.hidden);

    const label = item.hidden ? `${item.item} (hidden)` : item.item;

    const common = {
      label,
      layer: layer.id,
      className: layer.className,
      highlightKey: entryKey(layer.id, label),
      tooltip: itemTooltip?.(item),
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

  const npcTotals = new Map<string, number>();
  const npcSeen = new Map<string, number>();

  for (const { name } of npcs)
    npcTotals.set(name, (npcTotals.get(name) ?? 0) + 1);

  const npcMarkers: Array<LayeredMapLink> = npcs.map((npc) => {
    const layer = npcLayer(npc.special);
    const count = (npcSeen.get(npc.name) ?? 0) + 1;
    const label =
      (npcTotals.get(npc.name) ?? 0) > 1 ? `${npc.name} #${count}` : npc.name;

    npcSeen.set(npc.name, count);
    const [offsetX, offsetY] = npc.spriteOffset ?? DEFAULT_SPRITE_OFFSET;

    return {
      x: (npc.x + offsetX / TILE_PIXELS) * tileSize,
      y: (npc.y + offsetY / TILE_PIXELS) * tileSize,
      width: tileSize,
      height: tileSize,
      label,
      layer: layer.id,
      className: layer.className,
      highlightKey: [
        entryKey(layer.id, label),
        ...npc.dialog.flatMap(({ trade }) =>
          trade ? [tradeHighlightKey(trade.receive.number)] : [],
        ),
      ],
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
      const label = opens ? openableNames[opens] : sign.text;

      return {
        x: sign.x * tileSize,
        y: sign.y * tileSize - tileSize / 4,
        width: tileSize,
        height: tileSize,
        label,
        layer: layer.id,
        className: layer.className,
        highlightKey: entryKey(layer.id, label),
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
      highlightKey: entryKey(layer.id, sign.text),
      tooltip: signTooltip?.(sign),
      tooltipOnClick: true,
      icon: { kind: 'sign' as const },
    };
  });

  const staticMarkers: Array<LayeredMapLink> = staticPokemon.map((marker) => {
    const layer = staticLayer();

    const label = marker.kind === 'gift' ? 'Gift Pokémon' : 'Static Pokémon';

    const common = {
      label,
      layer: layer.id,
      className: layer.className,
      highlightKey: [
        entryKey(layer.id, label),
        ...marker.pokemon.map(({ number }) => staticHighlightKey(number)),
      ],
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

  const mapLinks = [
    ...wildMarkers,
    ...links.filter(
      (link) => link.layer !== 'connections' && link.layer !== 'buildings',
    ),
    ...connectionIcons,
    ...buildingIcons,
    ...itemMarkers,
    ...staticMarkers,
    ...trainerMarkers,
    ...npcMarkers,
    ...signMarkers,
  ];

  const entriesFor = (layer: MapLayerId) => {
    const entries = new Map<string, LayerEntry>();

    for (const link of mapLinks) {
      const key = link.href ?? [link.highlightKey].flat()[0];

      if (link.layer !== layer || !key || entries.has(key)) continue;

      entries.set(key, {
        key,
        name: link.label,
        href: link.href,
        travel: link.travel,
        replace: link.replace,
        opens: Boolean(link.tooltip),
      });
    }

    return entries;
  };

  const listedHrefs = new Set(mapLinks.flatMap((link) => link.href ?? []));
  const unlistedChildren: Array<LayerEntry> = location.locations
    .map((child) => {
      const childHref = href(joinPath(path, child.id));

      return { key: childHref, name: child.name, href: childHref };
    })
    .filter((entry) => !listedHrefs.has(entry.href));

  const groupFor = (id: MapLayerId): LayerGroup => {
    const layer = mapLayers.find((entry) => entry.id === id)!;
    const entries = entriesFor(id);

    if (id === 'buildings')
      for (const entry of unlistedChildren) entries.set(entry.key, entry);

    return { layer, entries: [...entries.values()] };
  };

  const layerSections: Array<LayerSection> = PANEL_SECTIONS.map(
    ({ id, layers }) => ({
      id,
      groups: layers.map(groupFor).filter(({ entries }) => entries.length > 0),
    }),
  ).filter(({ groups }) => groups.length > 0);

  return { links: mapLinks, layerSections };
};
