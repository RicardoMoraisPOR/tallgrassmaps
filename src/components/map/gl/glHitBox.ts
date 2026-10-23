import type { Map as MapLibreMap, PointLike } from 'maplibre-gl';

import type { MapLink } from '../viewer/types';
import { toLngLat } from './glCoordinates';

const SPRITE_LAYERS = new Set(['sprites', 'sprites-hi', 'sprites-active']);

const HIT_TOLERANCE_PIXELS = 3;

export const hitsVisibleSprite = (
  map: MapLibreMap,
  layerId: string,
  link: MapLink,
  point: PointLike,
) => {
  if (!SPRITE_LAYERS.has(layerId)) return true;

  const [x, y] = Array.isArray(point) ? point : [point.x, point.y];
  const centerX = link.x + link.width / 2;
  const base = map.project(toLngLat(centerX, link.y + link.height));
  const side = map.project(toLngLat(centerX + 1, link.y + link.height));
  const unit = Math.hypot(side.x - base.x, side.y - base.y);
  const halfWidth = (link.width * unit) / 2 + HIT_TOLERANCE_PIXELS;
  const height = link.height * unit + HIT_TOLERANCE_PIXELS;

  return (
    Math.abs(x - base.x) <= halfWidth &&
    base.y - y <= height &&
    y - base.y <= HIT_TOLERANCE_PIXELS
  );
};
