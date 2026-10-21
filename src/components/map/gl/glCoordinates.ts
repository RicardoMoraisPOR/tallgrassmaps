const TILE_SIZE = 512;
const DEGREES_IN_WORLD = 360;

export const BASE_ZOOM = 14;

const DEGREES_PER_PIXEL = DEGREES_IN_WORLD / (TILE_SIZE * 2 ** BASE_ZOOM);

export type GlPoint = [lng: number, lat: number];

export const toLngLat = (x: number, y: number): GlPoint => [
  x * DEGREES_PER_PIXEL,
  -y * DEGREES_PER_PIXEL,
];

export const fromLngLat = ({ lng, lat }: { lng: number; lat: number }) => ({
  x: lng / DEGREES_PER_PIXEL,
  y: -lat / DEGREES_PER_PIXEL,
});

export const toGlZoom = (zoom: number) => zoom + BASE_ZOOM;

export const fromGlZoom = (zoom: number) => zoom - BASE_ZOOM;

export const rectCorners = (
  x: number,
  y: number,
  width: number,
  height: number,
): [GlPoint, GlPoint, GlPoint, GlPoint] => [
  toLngLat(x, y),
  toLngLat(x + width, y),
  toLngLat(x + width, y + height),
  toLngLat(x, y + height),
];

export const rectBounds = (
  x: number,
  y: number,
  width: number,
  height: number,
): [GlPoint, GlPoint] => [toLngLat(x, y + height), toLngLat(x + width, y)];
