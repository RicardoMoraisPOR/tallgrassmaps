import { useEffect } from 'react';

import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';

import type { MapLink } from '../viewer/types';
import { BASE_ZOOM, toLngLat } from './glCoordinates';

const SPRITE_SHADOWS = 'shadows-sprites';
const ICON_SHADOWS = 'shadows-icons';
const IMAGE = 'ground-shadow';
const IMAGE_WIDTH = 32;
const IMAGE_HEIGHT = 16;
const IMAGE_RATIO = 4;
const SPRITE_SHADOW_RATIO = 0.7;
const ICON_SHADOW_PX = 28;
const MIN_ZOOM = 0;
const MAX_ZOOM = 22;
const TILT_FADE_MS = 500;
const ICON_DROP_PX = 6;

const addImage = (map: MapLibreMap) => {
  if (map.hasImage(IMAGE)) return;

  const canvas = document.createElement('canvas');

  canvas.width = IMAGE_WIDTH * IMAGE_RATIO;
  canvas.height = IMAGE_HEIGHT * IMAGE_RATIO;

  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (!context) return;

  context.translate(canvas.width / 2, canvas.height / 2);
  context.scale(1, IMAGE_HEIGHT / IMAGE_WIDTH);

  const gradient = context.createRadialGradient(
    0,
    0,
    0,
    0,
    0,
    canvas.width / 2,
  );

  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  context.fillStyle = gradient;
  context.fillRect(
    -canvas.width,
    -canvas.width,
    canvas.width * 2,
    canvas.width * 2,
  );

  map.addImage(IMAGE, context.getImageData(0, 0, canvas.width, canvas.height), {
    pixelRatio: IMAGE_RATIO,
  });
};

const layoutFor = (size: unknown) => ({
  'icon-image': IMAGE,
  'icon-anchor': 'center' as const,
  'icon-allow-overlap': true,
  'icon-ignore-placement': true,
  'icon-pitch-alignment': 'map' as const,
  'icon-rotation-alignment': 'map' as const,
  'icon-size': size as never,
  'icon-offset': ['get', 'offset'] as never,
});

type GlShadowsProps = {
  map: MapLibreMap;
  links: Array<MapLink>;
  tilted: boolean;
};

export const GlShadows = ({ map, links, tilted }: GlShadowsProps) => {
  useEffect(() => {
    addImage(map);

    [SPRITE_SHADOWS, ICON_SHADOWS].forEach((id) =>
      map.addSource(id, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      }),
    );

    const spriteScale = [
      'interpolate',
      ['exponential', 2],
      ['zoom'],
      MIN_ZOOM,
      ['*', ['get', 'scale'], 2 ** (MIN_ZOOM - BASE_ZOOM)],
      MAX_ZOOM,
      ['*', ['get', 'scale'], 2 ** (MAX_ZOOM - BASE_ZOOM)],
    ];

    map.addLayer(
      {
        id: SPRITE_SHADOWS,
        type: 'symbol',
        source: SPRITE_SHADOWS,
        layout: layoutFor(spriteScale),
        paint: {
          'icon-opacity': 0,
          'icon-opacity-transition': { duration: TILT_FADE_MS },
        },
      },
      'z-sprites',
    );
    map.addLayer(
      {
        id: ICON_SHADOWS,
        type: 'symbol',
        source: ICON_SHADOWS,
        layout: layoutFor([
          'interpolate',
          ['exponential', 2],
          ['zoom'],
          BASE_ZOOM - 0.3785,
          (16 / IMAGE_WIDTH) * (ICON_SHADOW_PX / 28),
          BASE_ZOOM + 0.4285,
          (28 / IMAGE_WIDTH) * (ICON_SHADOW_PX / 28),
        ]),
        paint: {
          'icon-opacity': 0,
          'icon-opacity-transition': { duration: TILT_FADE_MS },
        },
      },
      'z-icons',
    );

    return () => {
      [ICON_SHADOWS, SPRITE_SHADOWS].forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id);

        if (map.getSource(id)) map.removeSource(id);
      });
    };
  }, [map]);

  useEffect(() => {
    (map.getSource(SPRITE_SHADOWS) as GeoJSONSource | undefined)?.setData({
      type: 'FeatureCollection',
      features: links.flatMap((link) =>
        link.sprite
          ? [
              {
                type: 'Feature' as const,
                properties: {
                  scale: (link.width * SPRITE_SHADOW_RATIO) / IMAGE_WIDTH,
                  offset: [0, 0],
                },
                geometry: {
                  type: 'Point' as const,
                  coordinates: toLngLat(
                    link.x + link.width / 2,
                    link.y + link.height,
                  ),
                },
              },
            ]
          : [],
      ),
    });
    (map.getSource(ICON_SHADOWS) as GeoJSONSource | undefined)?.setData({
      type: 'FeatureCollection',
      features: links.flatMap((link) =>
        link.icon
          ? [
              {
                type: 'Feature' as const,
                properties: { offset: [0, ICON_DROP_PX] },
                geometry: {
                  type: 'Point' as const,
                  coordinates: toLngLat(link.x, link.y),
                },
              },
            ]
          : [],
      ),
    });
  }, [map, links]);

  useEffect(() => {
    [SPRITE_SHADOWS, ICON_SHADOWS].forEach((id) =>
      map.setPaintProperty(id, 'icon-opacity', tilted ? 1 : 0),
    );
  }, [map, tilted]);

  return null;
};
