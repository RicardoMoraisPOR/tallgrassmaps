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
    label: 'Wild Pokémon',
    color: 'var(--map-wild-pokemon)',
    className: 'map-link-wild-pokemon',
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

export const staticLayer = () => layer('static-pokemon');

export const useSavedMapLayers = () => {
  const saved = useSettingsStore((state) => state.mapLayers);
  const setMapLayer = useSettingsStore((state) => state.setMapLayer);

  const isVisible = (id: MapLayerId) => saved[id] ?? true;

  const setVisible = (id: MapLayerId, visible: boolean) =>
    setMapLayer(id, visible);

  return { isVisible, setVisible };
};

export const useMapLayers = () => {
  const { isVisible } = useSavedMapLayers();

  return new Set(
    mapLayers.filter(({ id }) => !isVisible(id)).map(({ id }) => id),
  );
};
