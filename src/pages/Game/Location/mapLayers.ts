import { useState } from 'react';

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
  | 'signs';

export type MapLayer = {
  id: MapLayerId;
  label: string;
  color: string;
  className: string;
  hiddenByDefault?: boolean;
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
    hiddenByDefault: true,
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
    hiddenByDefault: true,
  },
  {
    id: 'npcs',
    label: 'NPCs',
    color: 'var(--map-npc)',
    className: 'map-link-npc',
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

export const npcLayer = () => layer('npcs');

export const signLayer = () => layer('signs');

export const wildLayer = () => layer('wild-pokemon');

export const staticLayer = () => layer('static-pokemon');

type LayerValues = Partial<Record<MapLayerId, boolean>>;

export const useSavedMapLayers = () => {
  const saved = useSettingsStore((state) => state.mapLayers);
  const setMapLayer = useSettingsStore((state) => state.setMapLayer);

  const isVisible = (id: MapLayerId) => saved[id] ?? !layer(id).hiddenByDefault;

  const setVisible = (id: MapLayerId, visible: boolean) =>
    setMapLayer(id, visible);

  return { isVisible, setVisible };
};

export const useMapLayers = (scope: string) => {
  const saved = useSavedMapLayers();
  const [local, setLocal] = useState<{ scope: string; values: LayerValues }>({
    scope,
    values: {},
  });

  if (local.scope !== scope) setLocal({ scope, values: {} });

  const values = local.scope === scope ? local.values : {};
  const isVisible = (id: MapLayerId) => values[id] ?? saved.isVisible(id);
  const hiddenLayers = new Set(
    mapLayers.filter(({ id }) => !isVisible(id)).map(({ id }) => id),
  );

  const toggle = (id: MapLayerId) =>
    setLocal({ scope, values: { ...values, [id]: !isVisible(id) } });

  const reset = (id: MapLayerId) => {
    const { [id]: _removed, ...rest } = values;

    setLocal({ scope, values: rest });
  };

  return { hiddenLayers, toggle, reset };
};
