import { useEffect, useEffectEvent, useRef } from 'react';

import { Map as MapLibreMap } from 'maplibre-gl';

import { type Region } from '@/data/maps';
import { useSettingsStore } from '@/stores/settings';

import { fromGlZoom, fromLngLat, toLngLat } from '../gl/glCoordinates';
import { fitZoom, frameFor, type Zone } from './zoneGeometry';

const EXTRA_ZOOM_OUT = 0.5;
const CLAMP_MS = 200;
const FLY_MS = 500;

type ZoneCameraProps = {
  map: MapLibreMap;
  region: Region;
  zone: Zone | undefined;
  rightInset: number;
  onMinZoom: (zoom: number) => void;
};

export const ZoneCamera = ({
  map,
  region,
  zone,
  rightInset,
  onMinZoom,
}: ZoneCameraProps) => {
  const animations = useSettingsStore((state) => state.animations);
  const arrived = useRef(false);
  const previous = useRef<Zone | null>(null);
  const flying = useRef(false);
  const silent = useRef(false);
  const moved = useRef(false);

  const silently = (action: () => void) => {
    silent.current = true;

    try {
      action();
    } finally {
      silent.current = false;
    }
  };

  const target = zone?.focus ?? { x: 0, y: 0, ...region };

  const constrain = () =>
    silently(() => {
      map.setMaxBounds(null);
      map.setMinZoom(0);
      const minZoom = fitZoom(map, region) - EXTRA_ZOOM_OUT;

      map.setMinZoom(minZoom);
      onMinZoom(fromGlZoom(minZoom));
    });

  const frameZone = useEffectEvent(() => {
    const animate =
      arrived.current && animations && previous.current !== (zone ?? null);

    arrived.current = true;
    previous.current = zone ?? null;
    constrain();

    const { center, zoom } = frameFor(
      map,
      target,
      rightInset,
      zone ? 0 : EXTRA_ZOOM_OUT,
    );

    const settle = () => {
      flying.current = false;
      moved.current = false;
    };

    flying.current = animate;
    map.once('moveend', settle);

    if (animate) map.flyTo({ center, zoom, duration: FLY_MS });
    else silently(() => map.jumpTo({ center, zoom }));

    return () => {
      map.off('moveend', settle);
    };
  });

  useEffect(() => frameZone(), [zone, region, map, animations, rightInset]);

  useEffect(() => {
    const onStart = (event: { originalEvent?: unknown }) => {
      if (event.originalEvent && !flying.current && !silent.current)
        moved.current = true;
    };
    const clamp = () => {
      if (flying.current || silent.current) return;

      const { x, y } = fromLngLat(map.getCenter());
      const inside = {
        x: Math.min(Math.max(x, 0), region.width),
        y: Math.min(Math.max(y, 0), region.height),
      };

      if (inside.x !== x || inside.y !== y)
        map.easeTo({
          center: toLngLat(inside.x, inside.y),
          duration: CLAMP_MS,
        });
    };

    map.on('movestart', onStart);
    map.on('moveend', clamp);

    return () => {
      map.off('movestart', onStart);
      map.off('moveend', clamp);
    };
  }, [map, region, rightInset]);

  const refit = useEffectEvent(() => {
    if (flying.current) return;

    silently(() => {
      constrain();

      if (!moved.current) {
        const frame = frameFor(
          map,
          target,
          rightInset,
          zone ? 0 : EXTRA_ZOOM_OUT,
        );

        map.jumpTo(frame);
      }
    });
  });

  useEffect(() => {
    const onResize = () => refit();

    map.on('resize', onResize);

    return () => {
      map.off('resize', onResize);
    };
  }, [zone, region, map, rightInset]);

  return null;
};
