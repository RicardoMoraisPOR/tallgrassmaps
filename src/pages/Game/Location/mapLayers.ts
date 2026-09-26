import type { LocationHotspot, MarkerKind } from '@/data/maps';

export type MapLayerId =
  | 'connections'
  | 'entrances'
  | 'houses'
  | 'marts'
  | 'centers'
  | 'items'
  | 'hidden-items';

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
    id: 'entrances',
    label: 'Entrances',
    color: 'var(--map-entrance)',
    className: 'map-link-entrance',
  },
  {
    id: 'houses',
    label: 'Houses',
    color: 'var(--map-house)',
    className: 'map-link-house',
    hiddenByDefault: true,
  },
  {
    id: 'marts',
    label: 'Poké Marts',
    color: 'var(--map-mart)',
    className: 'map-link-mart',
    hiddenByDefault: true,
  },
  {
    id: 'centers',
    label: 'Pokémon Centers',
    color: 'var(--map-center)',
    className: 'map-link-center',
    hiddenByDefault: true,
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
];

const hotspotLayers: Record<LocationHotspot['kind'], MapLayerId> = {
  exit: 'connections',
  entrance: 'entrances',
};

const markerLayers: Record<MarkerKind, MapLayerId> = {
  house: 'houses',
  mart: 'marts',
  center: 'centers',
};

const layer = (id: MapLayerId) => mapLayers.find((entry) => entry.id === id)!;

export const hotspotLayer = (hotspot: LocationHotspot) =>
  layer(hotspotLayers[hotspot.kind]);

export const markerLayer = (kind: MarkerKind) => layer(markerLayers[kind]);

export const itemLayer = (hidden: boolean) =>
  layer(hidden ? 'hidden-items' : 'items');

export const defaultHiddenLayers = () =>
  new Set(
    mapLayers.filter((entry) => entry.hiddenByDefault).map(({ id }) => id),
  );
