import type { Map as MapLibreMap } from 'maplibre-gl';

export const GL_ANCHORS = [
  'z-floors',
  'z-frames',
  'z-areas',
  'z-shapes',
  'z-sprites',
  'z-sprites-active',
  'z-icons',
  'z-badges',
  'z-top',
] as const;

export type GlAnchor = (typeof GL_ANCHORS)[number];

export const addAnchors = (map: MapLibreMap) =>
  GL_ANCHORS.forEach((id) =>
    map.addLayer({
      id,
      type: 'background',
      paint: { 'background-opacity': 0 },
    }),
  );

export const FEATURE_ZOOM_SCALE = (
  baseZoom: number,
  minZoom: number,
  maxZoom: number,
) =>
  [
    'interpolate',
    ['exponential', 2],
    ['zoom'],
    minZoom,
    2 ** (minZoom - baseZoom),
    maxZoom,
    2 ** (maxZoom - baseZoom),
  ] as const;

const ICON_MIN_PX = 16;
const ICON_MAX_PX = 28;
const ICON_TILE_RATIO = 1.3;
const GAME_TILE = 16;
const BASE_ZOOM = 14;

export const iconScaleStops = (iconSize: number) => {
  const low = Math.log2(ICON_MIN_PX / (GAME_TILE * ICON_TILE_RATIO));
  const high = Math.log2(ICON_MAX_PX / (GAME_TILE * ICON_TILE_RATIO));

  return [
    'interpolate',
    ['exponential', 2],
    ['zoom'],
    BASE_ZOOM + low,
    ICON_MIN_PX / iconSize,
    BASE_ZOOM + high,
    ICON_MAX_PX / iconSize,
  ];
};
