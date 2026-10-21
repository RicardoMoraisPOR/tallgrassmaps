import { useEffect, useState } from 'react';

import { type GbcPaletteId, gbcPalettes } from '@/data/maps/gbcPalettes';

const MAX_CHANNEL = 31;
const BYTE = 255;
const SHADE_STEPS = [48, 132, 208];

const cache = new Map<string, Promise<string>>();

const load = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

const shadeOf = (grey: number) => {
  const step = SHADE_STEPS.findIndex((limit) => grey < limit);

  return step === -1 ? 0 : SHADE_STEPS.length - step;
};

const recolor = async (src: string, id: GbcPaletteId) => {
  const image = await load(src);
  const canvas = document.createElement('canvas');

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (!context) return src;

  context.drawImage(image, 0, 0);

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  const colors = gbcPalettes[id].map((channels) =>
    channels.map((channel) => Math.round((channel * BYTE) / MAX_CHANNEL)),
  );

  for (let index = 0; index < pixels.data.length; index += 4) {
    const [r, g, b] = colors[shadeOf(pixels.data[index])];

    pixels.data[index] = r;
    pixels.data[index + 1] = g;
    pixels.data[index + 2] = b;
  }

  context.putImageData(pixels, 0, 0);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve),
  );

  return blob ? URL.createObjectURL(blob) : src;
};

const recolored = (src: string, id: GbcPaletteId) => {
  const key = `${id}|${src}`;
  const cached = cache.get(key) ?? recolor(src, id).catch(() => src);

  cache.set(key, cached);

  return cached;
};

export const useRecoloredImage = (
  src: string,
  id: GbcPaletteId | undefined,
) => {
  const [colored, setColored] = useState<{ key: string; url: string }>();
  const key = id ? `${id}|${src}` : undefined;

  useEffect(() => {
    if (!id || !key) return undefined;

    let current = true;

    recolored(src, id).then((url) => {
      if (current) setColored({ key, url });
    });

    return () => {
      current = false;
    };
  }, [src, id, key]);

  return key && colored?.key === key ? colored.url : src;
};
