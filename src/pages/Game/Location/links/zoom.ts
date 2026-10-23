import type { MapImage } from '@/data/maps';

const VIEWPORT_PIXELS = 720;
const MIN_VISIBLE_TILES = 8;
const MAX_VISIBLE_TILES = 14;
const MAX_FOCUS_ZOOM = 3;

export const focusZoom = (
  { width, height }: Pick<MapImage, 'width' | 'height'>,
  tileSize: number,
) => {
  const shortSideTiles = Math.min(width, height) / tileSize;
  const visibleTiles = Math.min(
    Math.max(shortSideTiles, MIN_VISIBLE_TILES),
    MAX_VISIBLE_TILES,
  );
  const zoom = Math.log2(VIEWPORT_PIXELS / (visibleTiles * tileSize));

  return Math.round(Math.min(Math.max(zoom, 0), MAX_FOCUS_ZOOM) * 4) / 4;
};
