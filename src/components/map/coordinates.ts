import type { LatLngBoundsLiteral, LatLngTuple } from 'leaflet';

import type { MapImage } from '@/data/maps';

export const toLatLng = (x: number, y: number): LatLngTuple => [-y, x];

export const imageBounds = (map: MapImage): LatLngBoundsLiteral => [
  toLatLng(0, map.height),
  toLatLng(map.width, 0),
];

export const percent = (value: number, total: number) =>
  `${(value / total) * 100}%`;
