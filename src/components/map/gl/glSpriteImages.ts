import type { Map as MapLibreMap } from 'maplibre-gl';

import type { GbcPaletteId } from '@/data/maps/gbcPalettes';
import type { SpriteFacing } from '@/data/trainers/types';

import { recolored } from '../viewer/useRecoloredImage';

const FRAMES = 3;
export const SPRITE_LO_SCALE = 4;
export const SPRITE_HI_SCALE = 8;
const SPRITE_SCALE = SPRITE_HI_SCALE;

const frameOf: Record<SpriteFacing, number> = {
  down: 0,
  up: 1,
  left: 2,
  right: 2,
};

export type SpriteWant = {
  src: string;
  facing: SpriteFacing;
  width: number;
  height: number;
  palette?: GbcPaletteId;
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

export const spriteBaseName = ({
  src,
  facing,
  width,
  height,
  palette,
}: SpriteWant) => `${palette ?? 'plain'}|${src}|${facing}|${width}x${height}`;

export const spriteImageName = (want: SpriteWant, scale: number) =>
  `${spriteBaseName(want)}|x${scale}`;

const cut = async (want: SpriteWant, scale = 1) => {
  const { src, facing, width, height, palette } = want;
  const image = await loadImage(palette ? await recolored(src, palette) : src);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });

  canvas.width = width * scale;
  canvas.height = height * scale;

  if (!context) throw new Error('No 2d context');

  const frameHeight = image.naturalHeight / FRAMES;

  context.imageSmoothingEnabled = false;

  if (facing === 'right') {
    context.translate(width * scale, 0);
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
    width * scale,
    height * scale,
  );

  return context.getImageData(0, 0, canvas.width, canvas.height);
};

const requested = new WeakMap<MapLibreMap, Map<string, Promise<void>>>();

export const ensureSpriteImages = async (
  map: MapLibreMap,
  wants: Array<SpriteWant>,
  scale: number,
) => {
  const known = requested.get(map) ?? new Map<string, Promise<void>>();

  requested.set(map, known);

  await Promise.all(
    wants.map((want) => {
      const name = spriteImageName(want, scale);
      const pending =
        known.get(name) ??
        cut(want, scale)
          .then((data) => {
            if (!map.hasImage(name))
              map.addImage(name, data, { pixelRatio: scale });
          })
          .catch(() => undefined);

      known.set(name, pending);

      return pending;
    }),
  );
};

const GLOW_SCALE = SPRITE_SCALE;
const GLOW_PAD = 3;
const GLOW_BLUR = 1;

export const spriteGlowName = (want: SpriteWant, color: string) =>
  `${spriteBaseName(want)}|glow|${color}`;

export const SPRITE_GLOW_PAD = GLOW_PAD;
export const SPRITE_GLOW_SCALE = GLOW_SCALE;

const glow = async (want: SpriteWant, color: string) => {
  const data = await cut(want);
  const source = document.createElement('canvas');

  source.width = data.width;
  source.height = data.height;
  source.getContext('2d')?.putImageData(data, 0, 0);

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });

  canvas.width = (data.width + GLOW_PAD * 2) * GLOW_SCALE;
  canvas.height = (data.height + GLOW_PAD * 2) * GLOW_SCALE;

  if (!context) throw new Error('No 2d context');

  context.imageSmoothingEnabled = false;

  const edge = GLOW_SCALE;
  const blur = GLOW_BLUR * GLOW_SCALE;

  context.filter = [
    `drop-shadow(${edge}px 0 0 ${color})`,
    `drop-shadow(${-edge}px 0 0 ${color})`,
    `drop-shadow(0 ${edge}px 0 ${color})`,
    `drop-shadow(0 ${-edge}px 0 ${color})`,
    `drop-shadow(0 0 ${blur}px ${color})`,
  ].join(' ');
  context.drawImage(
    source,
    GLOW_PAD * GLOW_SCALE,
    GLOW_PAD * GLOW_SCALE,
    data.width * GLOW_SCALE,
    data.height * GLOW_SCALE,
  );

  return context.getImageData(0, 0, canvas.width, canvas.height);
};

export const ensureSpriteGlows = async (
  map: MapLibreMap,
  wants: Array<{ want: SpriteWant; color: string }>,
) => {
  const known = requested.get(map) ?? new Map<string, Promise<void>>();

  requested.set(map, known);

  await Promise.all(
    wants.map(({ want, color }) => {
      const name = spriteGlowName(want, color);
      const pending =
        known.get(name) ??
        glow(want, color)
          .then((data) => {
            if (!map.hasImage(name))
              map.addImage(name, data, { pixelRatio: GLOW_SCALE });
          })
          .catch(() => undefined);

      known.set(name, pending);

      return pending;
    }),
  );
};
