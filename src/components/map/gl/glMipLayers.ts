import type { Map as MapLibreMap } from 'maplibre-gl';

import { BASE_ZOOM, type GlPoint } from './glCoordinates';

const MAX_LEVELS = 6;
const MIN_SIDE = 4;
const MAX_ZOOM = 24;
const LINEAR_SUFFIX = '~lin';
const LEVEL_SEPARATOR = '~';
const EPSILON = 0.001;

type PaintProperties = Record<string, unknown>;

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

const toBlobUrl = (canvas: HTMLCanvasElement) =>
  new Promise<string>((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(URL.createObjectURL(blob))
          : reject(new Error('No blob')),
      'image/png',
    ),
  );

const rangeFor = (id: string, key: string, threshold: number) => {
  if (id === key) return [BASE_ZOOM, MAX_ZOOM] as const;

  if (id === `${key}${LINEAR_SUFFIX}`)
    return [Math.min(threshold, BASE_ZOOM - EPSILON), BASE_ZOOM] as const;

  const level = Number(id.slice(key.length + LEVEL_SEPARATOR.length));

  return [threshold - level, threshold - level + 1] as const;
};

export const setMipThreshold = (
  map: MapLibreMap,
  key: string,
  layers: Iterable<string>,
  threshold: number,
) => {
  [...layers].forEach((id) => {
    if (!map.getLayer(id)) return;

    const [min, max] = rangeFor(id, key, threshold);

    map.setLayerZoomRange(id, min, max);
  });
};

type Options = {
  map: MapLibreMap;
  key: string;
  url: string;
  coordinates: [GlPoint, GlPoint, GlPoint, GlPoint];
  pixelated: boolean;
  paint: PaintProperties;
  before: () => string;
  threshold: () => number;
  minZoom: () => number;
  isCurrent: () => boolean;
  onLayer: (id: string) => void;
};

export const addMippedImage = async ({
  map,
  key,
  url,
  coordinates,
  pixelated,
  paint,
  before,
  threshold,
  minZoom,
  isCurrent,
  onLayer,
}: Options) => {
  map.addSource(key, { type: 'image', url, coordinates });
  map.addLayer(
    {
      id: key,
      type: 'raster',
      source: key,
      paint: {
        ...paint,
        'raster-resampling': pixelated ? 'nearest' : 'linear',
      },
    } as never,
    before(),
  );
  onLayer(key);

  const image = await loadImage(url).catch(() => undefined);

  if (!image || !isCurrent() || !map.getLayer(key)) return;

  let source: CanvasImageSource = image;
  let width = image.naturalWidth;
  let height = image.naturalHeight;
  const levels: Array<string> = [];

  for (let level = 1; level <= MAX_LEVELS; level += 1) {
    if (threshold() - level + 1 <= minZoom()) break;

    width = Math.max(Math.round(width / 2), 1);
    height = Math.max(Math.round(height / 2), 1);

    if (Math.min(width, height) < MIN_SIDE) break;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    if (!context) break;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(source, 0, 0, width, height);
    source = canvas;

    const levelUrl = await toBlobUrl(canvas).catch(() => undefined);

    if (!levelUrl || !isCurrent() || !map.getLayer(key)) return;

    const id = `${key}${LEVEL_SEPARATOR}${level}`;

    map.addSource(id, { type: 'image', url: levelUrl, coordinates });
    map.addLayer(
      {
        id,
        type: 'raster',
        source: id,
        paint: { ...paint, 'raster-resampling': 'linear' },
      } as never,
      before(),
    );
    onLayer(id);
    levels.push(id);
  }

  const linear = `${key}${LINEAR_SUFFIX}`;

  map.addLayer(
    {
      id: linear,
      type: 'raster',
      source: key,
      paint: { ...paint, 'raster-resampling': 'linear' },
    } as never,
    before(),
  );
  onLayer(linear);

  setMipThreshold(map, key, [key, linear, ...levels], threshold());
};
