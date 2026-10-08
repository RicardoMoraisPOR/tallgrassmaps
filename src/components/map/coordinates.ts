import type { LatLngBoundsLiteral, LatLngTuple } from 'leaflet';

import type { Hotspot, MapImage } from '@/data/maps';

export const toLatLng = (x: number, y: number): LatLngTuple => [-y, x];

export const imageBounds = (map: MapImage): LatLngBoundsLiteral => [
  toLatLng(0, map.height),
  toLatLng(map.width, 0),
];

export const percent = (value: number, total: number) =>
  `${(value / total) * 100}%`;

const DEFAULT_HOTSPOT_COLOR = 'oklch(0.62 0.24 25)';

const tint = (color: string, amount: number) =>
  `color-mix(in oklab, ${color} ${amount}%, transparent)`;

export const hotspotHighlight = ({ color = DEFAULT_HOTSPOT_COLOR }: Hotspot) =>
  tint(color, 60);

export const hotspotBorder = (color: string) =>
  `color-mix(in oklab, ${color}, black 35%)`;

export const hotspotTints = ({
  color = DEFAULT_HOTSPOT_COLOR,
}: Hotspot): Record<string, string> => ({
  '--hotspot-idle': tint(color, 50),
  '--hotspot-active': tint(color, 85),
  '--hotspot-highlight': tint(color, 60),
  '--hotspot-border': hotspotBorder(color),
});
