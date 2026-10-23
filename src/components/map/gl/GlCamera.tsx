import { useEffect, useRef } from 'react';

import type { LngLatBoundsLike, Map as MapLibreMap } from 'maplibre-gl';

import type { MapImage } from '@/data/maps';

import type { FloorStack } from '../MapViewer';
import type { FitBounds } from '../viewer/types';
import { takePendingView, type MapView } from '../viewer/viewHandoff';
import { isArriving } from './glArrival';
import {
  BASE_ZOOM,
  fromGlZoom,
  fromLngLat,
  rectBounds,
  toGlZoom,
  toLngLat,
} from './glCoordinates';

const FIT_PADDING_PIXELS = 48;

const fitZoomFor = (map: MapLibreMap, width: number, height: number) => {
  const { clientWidth, clientHeight } = map.getContainer();
  const zoom = Math.log2(
    Math.min(
      (clientWidth - FIT_PADDING_PIXELS * 2) / width,
      (clientHeight - FIT_PADDING_PIXELS * 2) / height,
    ),
  );

  return zoom < 0 ? zoom : Math.floor(zoom);
};
const FLIGHT_PADDING_PIXELS = 24;
const FLIGHT_MS = 700;
const FIT_BOUNDS_DELAY_MS = 350;
const FIT_BOUNDS_PADDING = 64;
const FIT_BOUNDS_MAX_ZOOM = 1;
const FOCUS_BELOW_ZOOM = 2;
const FOCUS_FLIGHT_MS = 600;
const TILT_MS = 500;
const TILT_CURVE = [0.77, 0, 0.175, 1] as const;

export const MAX_ZOOM = 3;

const bezierEase = ([x1, y1, x2, y2]: typeof TILT_CURVE) => {
  const at = (t: number, a: number, b: number) =>
    3 * a * (1 - t) ** 2 * t + 3 * b * (1 - t) * t ** 2 + t ** 3;

  return (progress: number) => {
    let low = 0;
    let high = 1;

    for (let step = 0; step < 24; step += 1) {
      const mid = (low + high) / 2;

      if (at(mid, x1, x2) < progress) low = mid;
      else high = mid;
    }

    return at((low + high) / 2, y1, y2);
  };
};

const tiltEase = bezierEase(TILT_CURVE);

type GlCameraProps = {
  map: MapLibreMap;
  image: MapImage;
  stack?: FloorStack;
  skipFlight: boolean;
  focusPoint?: {
    x: number;
    y: number;
    zoom?: number;
    bounds?: { x: number; y: number; width: number; height: number };
  };
  fitBounds?: FitBounds;
  tiltDegrees: number;
  onZoomChange?: (zoom: number) => void;
  onViewChange?: (view: MapView) => void;
};

export const GlCamera = ({
  map,
  image,
  stack,
  skipFlight,
  focusPoint,
  fitBounds,
  tiltDegrees,
  onZoomChange,
  onViewChange,
}: GlCameraProps) => {
  const { width, height } = image;
  const latest = useRef({ onZoomChange, onViewChange });

  const pitch = useRef(tiltDegrees);

  latest.current = { onZoomChange, onViewChange };
  pitch.current = tiltDegrees;

  useEffect(() => {
    const fitZoom = () => fitZoomFor(map, width, height);

    const applyLimits = () => {
      const zoom = toGlZoom(fitZoom());
      const { clientWidth, clientHeight } = map.getContainer();
      const scale = 2 ** (map.getZoom() - BASE_ZOOM);
      const fitScale = 2 ** (zoom - BASE_ZOOM);
      const padX = Math.max(
        clientWidth / scale / 2,
        (clientWidth / fitScale - width) / 2 + 1,
      );
      const padY = Math.max(
        clientHeight / scale / 2,
        (clientHeight / fitScale - height) / 2 + 1,
      );

      map.setMinZoom(zoom);
      map.setMaxBounds([
        toLngLat(-padX, height + padY),
        toLngLat(width + padX, -padY),
      ] satisfies LngLatBoundsLike);
    };

    const fitView = () => {
      map.setMaxBounds(null);
      map.setMinZoom(0);
      map.jumpTo({
        center: toLngLat(width / 2, height / 2),
        zoom: toGlZoom(fitZoom()),
      });
      applyLimits();
    };

    fitView();

    const pending = takePendingView();

    if (pending && toGlZoom(pending.zoom) >= map.getMinZoom())
      map.jumpTo({
        center: toLngLat(pending.x, pending.y),
        zoom: toGlZoom(pending.zoom),
      });

    const onResize = () => {
      if (map.isMoving()) {
        applyLimits();

        return;
      }

      const zoom = toGlZoom(fitZoom());

      if (map.getZoom() <= map.getMinZoom() || map.getZoom() < zoom) fitView();
      else applyLimits();
    };

    const remember = () => {
      const { x, y } = fromLngLat(map.getCenter());
      const view = { x, y, zoom: fromGlZoom(map.getZoom()) };

      latest.current.onViewChange?.(view);
    };

    const reportZoom = () =>
      latest.current.onZoomChange?.(fromGlZoom(map.getZoom()));

    map.on('resize', onResize);
    map.on('zoomend', applyLimits);
    map.on('moveend', remember);
    map.on('zoom', reportZoom);
    map.on('zoomend', reportZoom);
    map.on('moveend', reportZoom);
    reportZoom();
    remember();

    return () => {
      map.off('resize', onResize);
      map.off('zoomend', applyLimits);
      map.off('moveend', remember);
      map.off('zoom', reportZoom);
      map.off('zoomend', reportZoom);
      map.off('moveend', reportZoom);
    };
  }, [map, width, height]);

  const selected = stack?.floors.find(({ id }) => id === stack.selected);
  const flown = useRef<string | undefined>(
    stack?.flyOnMount ? undefined : selected?.id,
  );

  useEffect(() => {
    if (!selected || flown.current === selected.id) return undefined;

    if (skipFlight) {
      flown.current = selected.id;

      return undefined;
    }

    const arriving = flown.current === undefined;
    const timer = setTimeout(() => {
      flown.current = selected.id;

      map.fitBounds(
        rectBounds(selected.x, selected.y, selected.width, selected.height),
        {
          padding: FLIGHT_PADDING_PIXELS,
          duration: arriving ? 0 : FLIGHT_MS,
          pitch: pitch.current,
        },
      );
    }, 0);

    return () => clearTimeout(timer);
  }, [
    map,
    selected?.id,
    selected?.x,
    selected?.y,
    selected?.width,
    selected?.height,
    skipFlight,
  ]);

  useEffect(() => {
    if (!focusPoint) return undefined;

    const { bounds } = focusPoint;

    if (
      !bounds &&
      focusPoint.zoom === undefined &&
      fromGlZoom(map.getMinZoom()) >= FOCUS_BELOW_ZOOM
    )
      return undefined;

    const arriving = isArriving(map);
    const timer = setTimeout(() => {
      if (bounds) {
        map.flyTo({
          center: toLngLat(focusPoint.x, focusPoint.y),
          zoom: toGlZoom(fitZoomFor(map, bounds.width, bounds.height)),
          pitch: pitch.current,
          duration: arriving ? 0 : FLIGHT_MS,
        });

        return;
      }

      map.flyTo({
        center: toLngLat(focusPoint.x, focusPoint.y),
        zoom: toGlZoom(
          focusPoint.zoom ??
            Math.min(Math.floor(fromGlZoom(map.getMinZoom())) + 1, MAX_ZOOM),
        ),
        pitch: pitch.current,
        duration: arriving ? 0 : FOCUS_FLIGHT_MS,
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [
    map,
    focusPoint?.x,
    focusPoint?.y,
    focusPoint?.zoom,
    focusPoint?.bounds?.width,
    focusPoint?.bounds?.height,
  ]);

  const fit = fitBounds;

  useEffect(() => {
    if (!fit) return undefined;

    const timer = setTimeout(
      () =>
        map.fitBounds(rectBounds(fit.x, fit.y, fit.width, fit.height), {
          padding: FIT_BOUNDS_PADDING,
          maxZoom: toGlZoom(FIT_BOUNDS_MAX_ZOOM),
          pitch: pitch.current,
          duration: FLIGHT_MS,
        }),
      FIT_BOUNDS_DELAY_MS,
    );

    return () => clearTimeout(timer);
  }, [map, fit?.key, fit?.x, fit?.y, fit?.width, fit?.height]);

  useEffect(() => {
    const ease = () =>
      map.easeTo({ pitch: tiltDegrees, duration: TILT_MS, easing: tiltEase });

    if (!map.isMoving()) {
      ease();

      return undefined;
    }

    map.once('moveend', ease);

    return () => {
      map.off('moveend', ease);
    };
  }, [map, tiltDegrees]);

  return null;
};
