export const TILE_PIXELS = 16;

export const spriteBox = (x: number, y: number, tileSize: number) => ({
  x: x * tileSize,
  y: y * tileSize - tileSize / 4,
  width: tileSize,
  height: tileSize,
});

export const dotBox = (x: number, y: number, tileSize: number) => ({
  x: x * tileSize - tileSize / 4,
  y: y * tileSize - tileSize / 4,
  width: tileSize * 1.5,
  height: tileSize * 1.5,
});
