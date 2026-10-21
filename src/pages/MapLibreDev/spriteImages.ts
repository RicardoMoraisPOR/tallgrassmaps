import type { Map as MapLibreMap } from 'maplibre-gl';

import type { SpriteFacing } from '@/data/trainers/types';

import type { WorldData } from './worldData';

const FRAMES = 3;

const frameOf: Record<SpriteFacing, number> = {
  down: 0,
  up: 1,
  left: 2,
  right: 2,
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

export const spriteImageName = (
  src: string,
  facing: SpriteFacing,
  width: number,
  height: number,
) => `${src}|${facing}|${width}x${height}`;

const cut = async (
  src: string,
  facing: SpriteFacing,
  width: number,
  height: number,
) => {
  const image = await loadImage(src);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });

  canvas.width = width;
  canvas.height = height;

  if (!context) throw new Error('No 2d context');

  const frameHeight = image.naturalHeight / FRAMES;

  context.imageSmoothingEnabled = false;

  if (facing === 'right') {
    context.translate(width, 0);
    context.scale(-1, 1);
  }

  context.drawImage(
    image,
    0,
    frameHeight * frameOf[facing],
    image.naturalWidth,
    frameHeight,
    0,
    0,
    width,
    height,
  );

  return context.getImageData(0, 0, width, height);
};

export const addSpriteImages = async (
  map: MapLibreMap,
  links: WorldData['links'],
) => {
  const wanted = new Map<
    string,
    { src: string; facing: SpriteFacing; width: number; height: number }
  >();

  links.forEach(({ sprite, width, height }) => {
    if (!sprite) return;

    wanted.set(spriteImageName(sprite.src, sprite.facing, width, height), {
      src: sprite.src,
      facing: sprite.facing,
      width,
      height,
    });
  });

  await Promise.all(
    [...wanted].map(async ([name, { src, facing, width, height }]) => {
      const data = await cut(src, facing, width, height).catch(() => undefined);

      if (data && !map.hasImage(name)) map.addImage(name, data);
    }),
  );
};
