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

export type LayerView = 'focus' | 'world';

export const layerViews: Array<{ id: LayerView; label: string }> = [
  { id: 'world', label: 'World View' },
  { id: 'focus', label: 'Focus View' },
];

const hiddenByDefault: Record<LayerView, Array<MapLayerId>> = {
  focus: ['signs'],
  world: ['signs', 'connections'],
};

export const useSavedMapLayers = (view: LayerView) => {
  const saved = useSettingsStore((state) =>
    view === 'world' ? state.worldMapLayers : state.mapLayers,
  );
  const setMapLayer = useSettingsStore((state) =>
    view === 'world' ? state.setWorldMapLayer : state.setMapLayer,
  );

  const isVisible = (id: MapLayerId) =>
    saved[id] ?? !hiddenByDefault[view].includes(id);

  const setVisible = (id: MapLayerId, visible: boolean) =>
    setMapLayer(id, visible);

  return { isVisible, setVisible };
};

export const useMapLayers = (view: LayerView) => {
  const { isVisible } = useSavedMapLayers(view);

  return new Set(
    mapLayers.filter(({ id }) => !isVisible(id)).map(({ id }) => id),
  );
};

const MID_ZOOM = -1;
export const CLOSE_ZOOM = 0;

export const zoomTier = (zoom: number) =>
  zoom < MID_ZOOM ? 0 : zoom < CLOSE_ZOOM ? 1 : 2;

const worldLayerTier: Partial<Record<MapLayerId, number>> = {
  connections: 1,
  buildings: 2,
  services: 2,
  items: 2,
  'hidden-items': 2,
  'static-pokemon': 2,
  'special-npcs': 2,
  trainers: 2,
  npcs: 2,
  'wild-pokemon': 2,
  'wild-badges': 2,
  signs: 2,
};

export const layersHiddenAtTier = (tier: number | undefined) =>
  new Set(
    mapLayers
      .filter(
        ({ id }) => tier === undefined || tier < (worldLayerTier[id] ?? 0),
      )
      .map(({ id }) => id),
  );
