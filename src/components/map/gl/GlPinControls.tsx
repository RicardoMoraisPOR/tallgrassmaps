import { useEffect, useRef } from 'react';

import type { Map as MapLibreMap } from 'maplibre-gl';

import type { MapLink } from '../viewer/types';
import { MAX_ZOOM } from './GlCamera';
import { fromGlZoom, toGlZoom, toLngLat } from './glCoordinates';

const PAN_PADDING = 96;
const FLIGHT_MS = 700;

type PinRequest = { key: string; initial?: boolean };

export const GlPinOnRequest = ({
  map,
  request,
  links,
  minZoom,
  onPin,
}: {
  map: MapLibreMap;
  request?: PinRequest;
  links: Array<MapLink>;
  minZoom?: number;
  onPin: (link: MapLink) => void;
}) => {
  const handled = useRef(request?.initial ? undefined : request);

  useEffect(() => {
    if (!request || handled.current === request) return;

    const link = links.find(
      (entry) =>
        entry.tooltip && [entry.highlightKey].flat().includes(request.key),
    );

    if (!link) return;

    handled.current = request;

    const flightMs = request.initial ? 0 : FLIGHT_MS;
    const center = toLngLat(link.x + link.width / 2, link.y + link.height / 2);
    const current = fromGlZoom(map.getZoom());
    const zoom =
      link.zoom !== undefined
        ? Math.min(link.zoom, MAX_ZOOM)
        : minZoom === undefined
          ? current
          : Math.min(Math.max(current, minZoom), MAX_ZOOM);

    if (Math.abs(zoom - current) < 0.01) {
      const point = map.project(center);
      const { clientWidth, clientHeight } = map.getContainer();
      const inside =
        point.x >= PAN_PADDING &&
        point.x <= clientWidth - PAN_PADDING &&
        point.y >= PAN_PADDING &&
        point.y <= clientHeight - PAN_PADDING;

      if (inside) {
        onPin(link);

        return;
      }

      map.once('moveend', () => onPin(link));
      map.easeTo({ center, duration: flightMs });

      return;
    }

    map.once('moveend', () => onPin(link));
    map.flyTo({ center, zoom: toGlZoom(zoom), duration: flightMs });
  }, [map, request, links, minZoom, onPin]);

  return null;
};

export const GlUnpinWhenOffscreen = ({
  map,
  link,
  anchor,
  onDismiss,
}: {
  map: MapLibreMap;
  link: MapLink;
  anchor?: { x: number; y: number };
  onDismiss: () => void;
}) => {
  useEffect(() => {
    const target = anchor
      ? toLngLat(anchor.x, anchor.y)
      : toLngLat(link.x + link.width / 2, link.y + link.height / 2);
    const check = () => {
      if (!map.getBounds().contains(target)) onDismiss();
    };

    map.on('moveend', check);

    return () => {
      map.off('moveend', check);
    };
  }, [map, link, anchor, onDismiss]);

  return null;
};
