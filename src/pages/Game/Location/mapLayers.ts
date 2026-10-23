import type { LocationHotspot, MarkerKind } from '@/data/maps';
import { useSettingsStore } from '@/stores/settings';

export type MapLayerId =
  | 'connections'
  | 'buildings'
  | 'services'
  | 'items'
  | 'hidden-items'
  | 'trainers'
  | 'static-pokemon'
  | 'wild-pokemon'
  | 'wild-badges'
  | 'npcs'
  | 'special-npcs'
  | 'signs';

export type MapLayer = {
  id: MapLayerId;
  label: string;
  color: string;
  className: string;
};

export const mapLayers: Array<MapLayer> = [
  {
    id: 'connections',
    label: 'Connections',
    color: 'var(--map-connection)',
    className: 'map-link-connection',
  },
  {
    id: 'buildings',
    label: 'Buildings',
    color: 'var(--map-entrance)',
    className: 'map-link-entrance',
  },
  {
    id: 'services',
    label: 'Centers & Marts',
    color: 'var(--map-service)',
    className: 'map-link-service',
  },
  {
    id: 'items',
    label: 'Items',
    color: 'var(--map-item)',
    className: 'map-link-item',
  },
  {
    id: 'hidden-items',
    label: 'Hidden items',
    color: 'var(--map-hidden-item)',
    className: 'map-link-hidden-item',
  },
  {
    id: 'trainers',
    label: 'Trainers',
    color: 'var(--map-trainer)',
    className: 'map-link-trainer',
  },
  {
    id: 'static-pokemon',
    label: 'Static & gift Pokémon',
    color: 'var(--map-static-pokemon)',
    className: 'map-link-static-pokemon',
  },
  {
    id: 'wild-pokemon',
    label: 'Wild Pokémon Area',
    color: 'var(--map-wild-pokemon)',
    className: 'map-link-wild-pokemon',
  },
  {
    id: 'wild-badges',
    label: 'Wild Pokémon Badge',
    color: 'var(--map-wild-pokemon)',
    className: 'map-link-wild-badge',
  },
  {
    id: 'npcs',
    label: 'NPCs',
    color: 'var(--map-npc)',
    className: 'map-link-npc',
  },
  {
    id: 'special-npcs',
    label: 'Special NPCs',
    color: 'var(--map-special-npc)',
    className: 'map-link-special-npc',
  },
  {
    id: 'signs',
    label: 'Signs',
    color: 'var(--map-sign)',
    className: 'map-link-sign',
  },
];

const hotspotLayers: Record<LocationHotspot['kind'], MapLayerId> = {
  exit: 'connections',
  entrance: 'buildings',
};

const markerLayers: Record<MarkerKind, MapLayerId> = {
  house: 'buildings',
  cave: 'buildings',
  mart: 'services',
  center: 'services',
};

const layer = (id: MapLayerId) => mapLayers.find((entry) => entry.id === id)!;

export const hotspotLayer = (hotspot: LocationHotspot) =>
  layer(hotspotLayers[hotspot.kind]);

export const markerLayer = (kind: MarkerKind) => layer(markerLayers[kind]);

export const itemLayer = (hidden: boolean) =>
  layer(hidden ? 'hidden-items' : 'items');

export const trainerLayer = () => layer('trainers');

export const npcLayer = (special?: boolean) =>
  layer(special ? 'special-npcs' : 'npcs');

export const signLayer = () => layer('signs');

export const wildLayer = () => layer('wild-pokemon');

export const wildBadgeLayer = () => layer('wild-badges');

export const staticLayer = () => layer('static-pokemon');

const hiddenByDefault: Array<MapLayerId> = ['signs'];

export const isLayerVisible = (
  saved: Partial<Record<string, boolean>>,
  id: MapLayerId,
) => saved[id] ?? !hiddenByDefault.includes(id);

export const useMapLayers = () => {
  const saved = useSettingsStore((state) => state.mapLayers);

  return new Set(
    mapLayers
      .filter(({ id }) => !isLayerVisible(saved, id))
      .map(({ id }) => id),
  );
};

export const groupingLevels: Array<{
  label: string;
  hint: string;
  clusterZoom: number;
}> = [
  { label: 'Off', hint: 'Every marker shows at any zoom.', clusterZoom: -8 },
  {
    label: 'Low',
    hint: 'Place icons replace markers only while zoomed far out.',
    clusterZoom: -1,
  },
  {
    label: 'Medium',
    hint: 'Place icons replace markers until you zoom in a few steps.',
    clusterZoom: 0,
  },
  {
    label: 'High',
    hint: 'Place icons replace markers until you zoom in close.',
    clusterZoom: 1,
  },
];

export const nearestGroupingLevel = (clusterZoom: number) =>
  groupingLevels.reduce((nearest, level) =>
    Math.abs(level.clusterZoom - clusterZoom) <
    Math.abs(nearest.clusterZoom - clusterZoom)
      ? level
      : nearest,
  );

export const zoomTier = (zoom: number, clusterZoom: number) =>
  zoom < clusterZoom ? 0 : 1;

const focusOnlyLayer: MapLayerId = 'connections';

const worldLayerTier: Partial<Record<MapLayerId, number>> = {
  buildings: 1,
  services: 1,
  items: 1,
  'hidden-items': 1,
  'static-pokemon': 1,
  'special-npcs': 1,
  trainers: 1,
  npcs: 1,
  'wild-pokemon': 1,
  'wild-badges': 1,
  signs: 1,
};

export const layersHiddenAtTier = (tier: number | undefined) =>
  new Set(
    mapLayers
      .filter(
        ({ id }) =>
          id === focusOnlyLayer ||
          tier === undefined ||
          tier < (worldLayerTier[id] ?? 0),
      )
      .map(({ id }) => id),
  );
