import { useEffect, useRef } from 'react';

import type { Map as MapLibreMap } from 'maplibre-gl';

import type { MapImage } from '@/data/maps';

import type { FloorStack } from '../MapViewer';
import type { MapPalette } from '../viewer/types';
import { recolored } from '../viewer/useRecoloredImage';
import { BASE_ZOOM, rectCorners } from './glCoordinates';
import { addMippedImage } from './glMipLayers';

const DIMMED_OPACITY = 0.25;
const FADE_MS = 150;
const COLOR_FADE_MS = 200;
const BASE_ID = 'base';

type Floor = {
  id: string;
  image: string;
  pixelated: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
};

type GlFloorImagesProps = {
  map: MapLibreMap;
  image: MapImage;
  stack?: FloorStack;
  palette?: MapPalette;
  crispZoom?: number;
};

const floorsOf = (image: MapImage, stack?: FloorStack): Array<Floor> =>
  stack
    ? stack.floors.map(
        ({ id, image: url, pixelated, x, y, width, height }) => ({
          id,
          image: url,
          pixelated,
          x,
          y,
          width,
          height,
        }),
      )
    : [
        {
          id: BASE_ID,
          image: image.image,
          pixelated: image.pixelated,
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        },
      ];

const baseGroup = (id: string) => `floor-${id}`;
const colorGroup = (id: string) => `floor-color-${id}`;

export const GlFloorImages = ({
  map,
  image,
  stack,
  palette,
  crispZoom = 0,
}: GlFloorImagesProps) => {
  const floors = floorsOf(image, stack);
  const floorKey = floors.map(({ id, image: url }) => `${id}:${url}`).join('|');
  const registry = useRef(new Map<string, Set<string>>());
  const opacities = useRef(new Map<string, number>());
  const colored = useRef(new Set<string>());
  const generation = useRef(0);
  const threshold = useRef(BASE_ZOOM + Math.min(crispZoom, 0));

  threshold.current = BASE_ZOOM + Math.min(crispZoom, 0);

  const opacityOf = (id: string) =>
    stack?.dimmed?.has(id) ? DIMMED_OPACITY : 1;

  const apply = (group: string) =>
    registry.current.get(group)?.forEach((layer) => {
      if (map.getLayer(layer))
        map.setPaintProperty(
          layer,
          'raster-opacity',
          opacities.current.get(group) ?? 1,
        );
    });

  const track = (group: string) => (layer: string) => {
    const layers = registry.current.get(group) ?? new Set<string>();

    layers.add(layer);
    registry.current.set(group, layers);
    apply(group);
  };

  useEffect(() => {
    generation.current += 1;

    const current = generation.current;
    const isCurrent = () => generation.current === current;

    floors.forEach((floor) => {
      const group = baseGroup(floor.id);

      opacities.current.set(group, opacityOf(floor.id));
      addMippedImage({
        map,
        key: group,
        url: floor.image,
        coordinates: rectCorners(floor.x, floor.y, floor.width, floor.height),
        pixelated: floor.pixelated,
        paint: {
          'raster-fade-duration': 0,
          'raster-opacity-transition': { duration: FADE_MS },
          'raster-opacity': opacities.current.get(group) ?? 1,
        },
        before: 'z-frames',
        threshold: () => threshold.current,
        minZoom: () => map.getMinZoom(),
        isCurrent,
        onLayer: track(group),
      });
    });

    return () => {
      generation.current += 1;
      registry.current.forEach((layers) => {
        layers.forEach((layer) => {
          if (map.getLayer(layer)) map.removeLayer(layer);
        });
        layers.forEach((layer) => {
          if (map.getSource(layer)) map.removeSource(layer);
        });
      });
      registry.current.clear();
      opacities.current.clear();
      colored.current.clear();
    };
  }, [map, floorKey, crispZoom]);

  useEffect(() => {
    floors.forEach((floor) => {
      const opacity = opacityOf(floor.id);

      opacities.current.set(baseGroup(floor.id), opacity);
      apply(baseGroup(floor.id));

      if (registry.current.has(colorGroup(floor.id))) {
        opacities.current.set(colorGroup(floor.id), palette?.on ? opacity : 0);
        apply(colorGroup(floor.id));
      }
    });
  }, [map, floorKey, stack?.selected, stack?.dimmed, palette?.on]);

  useEffect(() => {
    if (!palette?.on) return undefined;

    let cancelled = false;
    const current = generation.current;
    const isCurrent = () => !cancelled && generation.current === current;

    floors.forEach(async (floor) => {
      const id = palette.of(stack ? floor.id : undefined);

      if (!id || colored.current.has(floor.id)) return;

      const url = await recolored(floor.image, id);

      if (!isCurrent() || colored.current.has(floor.id)) return;

      colored.current.add(floor.id);

      const group = colorGroup(floor.id);

      opacities.current.set(group, 0);
      addMippedImage({
        map,
        key: group,
        url,
        coordinates: rectCorners(floor.x, floor.y, floor.width, floor.height),
        pixelated: floor.pixelated,
        paint: {
          'raster-fade-duration': 0,
          'raster-opacity-transition': { duration: COLOR_FADE_MS },
          'raster-opacity': 0,
        },
        before: 'z-frames',
        threshold: () => threshold.current,
        minZoom: () => map.getMinZoom(),
        isCurrent: () => generation.current === current,
        onLayer: track(group),
      });

      requestAnimationFrame(() => {
        opacities.current.set(group, opacityOf(floor.id));
        apply(group);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [map, floorKey, palette?.on, crispZoom]);

  return null;
};
