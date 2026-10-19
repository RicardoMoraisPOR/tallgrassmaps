import { useCallback, useEffect, useRef } from 'react';

import {
  type LatLngBoundsLiteral,
  type LatLngTuple,
  type Map as LeafletMap,
  Util,
} from 'leaflet';
import { useMap, useMapEvents } from 'react-leaflet';

import type { MapImage } from '@/data/maps';

import { toLatLng } from '../coordinates';
import { MAP_ICON_SIZE, MAX_ZOOM } from './constants';

const FOCUS_BELOW_ZOOM = 2;
const FOCUS_DELAY = 250;
const FOCUS_DURATION = 0.6;

const TILE = 16;
const MIN_ICON_SIZE = 16;
const ICON_TILE_RATIO = 1.3;

export const PanBounds = ({ bounds }: { bounds: LatLngBoundsLiteral }) => {
  const [[bottom, left], [top, right]] = bounds;
  const popupOpen = useRef(false);

  const update = useCallback(
    (leafletMap: LeafletMap) => {
      if (popupOpen.current) return leafletMap.setMaxBounds(undefined);

      const { x, y } = leafletMap.getSize();
      const scale = 2 ** leafletMap.getZoom();
      const padX = x / scale / 2;
      const padY = y / scale / 2;

      leafletMap.setMaxBounds([
        [bottom - padY, left - padX],
        [top + padY, right + padX],
      ]);
    },
    [bottom, left, top, right],
  );

  const leafletMap = useMapEvents({
    zoomend: ({ target }) => update(target),
    resize: ({ target }) => update(target),
    popupopen: ({ target }) => {
      popupOpen.current = true;
      update(target);
    },
    popupclose: ({ target }) => {
      popupOpen.current = false;
      update(target);
    },
  });

  useEffect(() => {
    update(leafletMap);
  }, [leafletMap, update]);

  return null;
};

const FIT_PADDING_PIXELS = 48;

type ZoomLimiter = { _limitZoom: (zoom: number) => number };

export const FitToViewport = ({
  map,
  focus,
}: {
  map: MapImage;
  focus?: LatLngTuple;
}) => {
  const leafletMap = useMap();
  const { width, height } = map;
  const [focusLat, focusLng] = focus ?? [];

  useEffect(() => {
    const limiter = leafletMap as unknown as ZoomLimiter;
    const snapAndClamp = limiter._limitZoom;

    limiter._limitZoom = (zoom) =>
      zoom <= leafletMap.getMinZoom()
        ? leafletMap.getMinZoom()
        : snapAndClamp.call(leafletMap, zoom);

    return () => {
      limiter._limitZoom = snapAndClamp;
    };
  }, [leafletMap]);

  useEffect(() => {
    const fitZoom = () => {
      const { x, y } = leafletMap.getSize();
      const zoom = Math.log2(
        Math.min(
          (x - FIT_PADDING_PIXELS * 2) / width,
          (y - FIT_PADDING_PIXELS * 2) / height,
        ),
      );

      return zoom < 0 ? zoom : Math.floor(zoom);
    };

    const fitView = () => {
      const zoom = fitZoom();

      Util.setOptions(leafletMap, { zoomSnap: 0 });
      leafletMap.setView(toLatLng(width / 2, height / 2), zoom, {
        animate: false,
      });
      Util.setOptions(leafletMap, { zoomSnap: 1 });
      leafletMap.setMinZoom(zoom);
    };

    fitView();

    const onResize = () => {
      const zoom = fitZoom();
      const current = leafletMap.getZoom();

      if (current <= leafletMap.getMinZoom() || current < zoom) {
        fitView();
      } else {
        leafletMap.setMinZoom(zoom);
      }
    };

    leafletMap.on('resize', onResize);

    const observer = new ResizeObserver(() =>
      leafletMap.invalidateSize({ pan: false }),
    );

    observer.observe(leafletMap.getContainer());

    return () => {
      observer.disconnect();
      leafletMap.off('resize', onResize);
    };
  }, [leafletMap, width, height]);

  useEffect(() => {
    const focusOn = (lat: number, lng: number) =>
      leafletMap.flyTo(
        [lat, lng],
        Math.min(Math.floor(leafletMap.getMinZoom()) + 1, MAX_ZOOM),
        { duration: FOCUS_DURATION },
      );

    const focusTimer =
      focusLat !== undefined &&
      focusLng !== undefined &&
      leafletMap.getMinZoom() < FOCUS_BELOW_ZOOM
        ? setTimeout(() => focusOn(focusLat, focusLng), FOCUS_DELAY)
        : undefined;

    return () => clearTimeout(focusTimer);
  }, [leafletMap, focusLat, focusLng]);

  return null;
};

export const IconSizeForZoom = () => {
  const leafletMap = useMap();

  useEffect(() => {
    const container = leafletMap.getContainer();
    const update = () => {
      const tile =
        leafletMap.latLngToContainerPoint(toLatLng(TILE, 0)).x -
        leafletMap.latLngToContainerPoint(toLatLng(0, 0)).x;
      const size = Math.min(
        MAP_ICON_SIZE,
        Math.max(MIN_ICON_SIZE, tile * ICON_TILE_RATIO),
      );

      container.style.setProperty('--map-icon-size', `${size}px`);
    };

    update();
    leafletMap.on('zoomend resize', update);

    return () => {
      leafletMap.off('zoomend resize', update);
    };
  }, [leafletMap]);

  return null;
};

export const PixelatedWhenZoomedIn = () => {
  const leafletMap = useMap();

  useEffect(() => {
    const container = leafletMap.getContainer();
    const update = () =>
      container.classList.toggle('map-pixelated', leafletMap.getZoom() >= 0);

    update();
    leafletMap.on('zoomend', update);

    return () => {
      leafletMap.off('zoomend', update);
    };
  }, [leafletMap]);

  return null;
};

type ZoomState = { _animatingZoom: boolean };

export const ResyncAfterInterruptedZoom = () => {
  const zooming = useRef(false);

  useMapEvents({
    zoomstart: () => {
      zooming.current = true;
    },
    zoomend: () => {
      zooming.current = false;
    },
    moveend: ({ target }) => {
      const state = target as unknown as ZoomState;
      const stuck = state._animatingZoom;

      if (!zooming.current && !stuck) return;

      zooming.current = false;
      state._animatingZoom = false;

      const zoom = target.getZoom();

      target.setView(
        target.getCenter(),
        zoom <= target.getMinZoom() ? zoom : Math.round(zoom),
        { reset: true, animate: false },
      );
    },
  });

  return null;
};

export const ReportZoom = ({
  onZoomChange,
}: {
  onZoomChange: (zoom: number) => void;
}) => {
  const leafletMap = useMapEvents({
    zoomend: () => onZoomChange(leafletMap.getZoom()),
    moveend: () => onZoomChange(leafletMap.getZoom()),
  });

  useEffect(() => {
    onZoomChange(leafletMap.getZoom());
  }, [leafletMap, onZoomChange]);

  return null;
};

export type ViewBox = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

const VIEW_BOX_SNAP = 256;
const VIEW_BOX_MARGIN = 1;
const VIEW_BOX_MAX_RATIO = 9;

const viewBoxOf = (leafletMap: LeafletMap): ViewBox => {
  const visible = leafletMap.getBounds();
  const width = visible.getEast() - visible.getWest();
  const height = visible.getNorth() - visible.getSouth();
  const snapDown = (value: number) =>
    Math.floor(value / VIEW_BOX_SNAP) * VIEW_BOX_SNAP;
  const snapUp = (value: number) =>
    Math.ceil(value / VIEW_BOX_SNAP) * VIEW_BOX_SNAP;

  return {
    minX: snapDown(visible.getWest() - width * VIEW_BOX_MARGIN),
    maxX: snapUp(visible.getEast() + width * VIEW_BOX_MARGIN),
    minY: snapDown(-visible.getNorth() - height * VIEW_BOX_MARGIN),
    maxY: snapUp(-visible.getSouth() + height * VIEW_BOX_MARGIN),
  };
};

const area = ({ minX, minY, maxX, maxY }: ViewBox) =>
  (maxX - minX) * (maxY - minY);

export const ReportViewBox = ({
  onChange,
}: {
  onChange: (box: ViewBox) => void;
}) => {
  const current = useRef<ViewBox>(undefined);
  const leafletMap = useMap();

  const update = useCallback(() => {
    const next = viewBoxOf(leafletMap);
    const visible = leafletMap.getBounds();
    const last = current.current;
    const stillCovers =
      last !== undefined &&
      last.minX <= visible.getWest() &&
      last.maxX >= visible.getEast() &&
      last.minY <= -visible.getNorth() &&
      last.maxY >= -visible.getSouth() &&
      area(last) <= area(next) * VIEW_BOX_MAX_RATIO;

    if (stillCovers) return;

    current.current = next;
    onChange(next);
  }, [leafletMap, onChange]);

  useMapEvents({
    move: update,
    moveend: update,
    zoomend: update,
    resize: update,
  });

  useEffect(() => {
    update();
  }, [update]);

  return null;
};
