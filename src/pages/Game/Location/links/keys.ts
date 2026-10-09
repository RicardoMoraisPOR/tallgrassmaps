import type { MapLayerId } from '../mapLayers';

export const entryKey = (layer: MapLayerId, name: string) => `${layer}:${name}`;
