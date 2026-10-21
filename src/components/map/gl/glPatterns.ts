import type { Map as MapLibreMap } from 'maplibre-gl';

import { probe, toRgba } from './glColors';

const RATIO = 2;

type PatternSpec = {
  name: string;
  size: [number, number];
  path: string;
  opacity: number;
};

const PATTERNS: Array<PatternSpec> = [
  {
    name: 'wild-grass',
    size: [16, 16],
    path: 'M-1 17 L17 -1 M15 17 L17 15 M-1 1 L1 -1',
    opacity: 0.4,
  },
  {
    name: 'wild-grass-hover',
    size: [9, 9],
    path: 'M-1 10 L10 -1 M8 10 L10 8 M-1 1 L1 -1',
    opacity: 0.7,
  },
  {
    name: 'wild-water',
    size: [20, 12],
    path: 'M0 6 Q5 1 10 6 T20 6',
    opacity: 0.4,
  },
  {
    name: 'wild-water-hover',
    size: [12, 8],
    path: 'M0 4 Q3 0.5 6 4 T12 4',
    opacity: 0.7,
  },
];

const wildColor = () =>
  toRgba(
    probe('map-link-wild-pokemon', (element) =>
      getComputedStyle(element).getPropertyValue('--map-link'),
    ) || 'oklch(0.74 0.17 125)',
  );

export const addWildPatterns = (map: MapLibreMap) => {
  const color = wildColor();

  PATTERNS.forEach(({ name, size: [width, height], path, opacity }) => {
    if (map.hasImage(name)) map.removeImage(name);

    const canvas = document.createElement('canvas');

    canvas.width = width * RATIO;
    canvas.height = height * RATIO;

    const context = canvas.getContext('2d', { willReadFrequently: true });

    if (!context) return;

    context.scale(RATIO, RATIO);
    context.strokeStyle = color;
    context.globalAlpha = opacity;
    context.lineWidth = 1;
    context.stroke(new Path2D(path));

    map.addImage(
      name,
      context.getImageData(0, 0, canvas.width, canvas.height),
      { pixelRatio: RATIO },
    );
  });
};
