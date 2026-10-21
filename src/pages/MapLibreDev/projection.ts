const TILE_SIZE = 512;
const DEGREES_IN_WORLD = 360;

export const BASE_ZOOM = 14;

const DEGREES_PER_PIXEL = DEGREES_IN_WORLD / (TILE_SIZE * 2 ** BASE_ZOOM);

export const toLngLat = (x: number, y: number): [number, number] => [
  x * DEGREES_PER_PIXEL,
  -y * DEGREES_PER_PIXEL,
];
