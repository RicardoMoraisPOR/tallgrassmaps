import type { Map as MapLibreMap } from 'maplibre-gl';

const ARRIVAL_WINDOW_MS = 1500;

const created = new WeakMap<MapLibreMap, number>();

export const markCreated = (map: MapLibreMap) =>
  created.set(map, performance.now());

export const isArriving = (map: MapLibreMap) =>
  performance.now() - (created.get(map) ?? 0) < ARRIVAL_WINDOW_MS;
