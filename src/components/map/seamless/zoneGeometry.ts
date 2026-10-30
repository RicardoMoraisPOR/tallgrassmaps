import { Map as MapLibreMap } from 'maplibre-gl';

import { type Hotspot, type Region } from '@/data/maps';

import { rectBounds } from '../gl/glCoordinates';

const SURROUNDING_SHARE = 0.75;

export type Rect = { x: number; y: number; width: number; height: number };

export type Zone = {
  index: number;
  target: string;
  layer?: string;
  name: string;
  hotspot: Hotspot & { shape: Array<[number, number]> };
  focus: Rect;
};

export const focusRect = (
  { x, y, width, height }: Hotspot,
  { width: mapWidth, height: mapHeight }: Region,
): Rect => {
  const side = Math.max(width, height) * (1 + SURROUNDING_SHARE * 2);
  const w = Math.min(side, mapWidth);
  const h = Math.min(side, mapHeight);

  return {
    x: Math.min(Math.max(0, x + width / 2 - w / 2), mapWidth - w),
    y: Math.min(Math.max(0, y + height / 2 - h / 2), mapHeight - h),
    width: w,
    height: h,
  };
};

export const boundsOf = ({ x, y, width, height }: Rect) =>
  rectBounds(x, y, width, height);

export const fitZoom = (map: MapLibreMap, region: Region) =>
  map.cameraForBounds(boundsOf({ x: 0, y: 0, ...region }))?.zoom ?? 0;

export const frameFor = (
  map: MapLibreMap,
  target: Rect,
  inset: number,
  zoomOut = 0,
) => {
  const usable = Math.min(inset, map.getContainer().clientWidth / 2);
  const camera = map.cameraForBounds(boundsOf(target), {
    padding: { top: 0, bottom: 0, left: 0, right: usable },
  });

  return {
    center: camera?.center ?? map.getCenter(),
    zoom: (camera?.zoom ?? map.getZoom()) - zoomOut,
  };
};
