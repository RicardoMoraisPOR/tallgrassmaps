import { useEffect, useRef } from 'react';

import { latLngBounds } from 'leaflet';
import { useMap, useMapEvents } from 'react-leaflet';

import { toLatLng } from '../coordinates';
import { FLIGHT_SECONDS } from './FloorFrames';
import type { MapLink } from './types';
import { whenFitSettled } from './ViewportEffects';

export const UnpinOnDismiss = ({ onDismiss }: { onDismiss: () => void }) => {
  const leafletMap = useMapEvents({ click: onDismiss });

  useEffect(() => {
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss();
    };
    const dismissOutside = (event: PointerEvent) => {
      if (!leafletMap.getContainer().contains(event.target as Node))
        onDismiss();
    };

    document.addEventListener('keydown', dismissOnEscape);
    document.addEventListener('pointerdown', dismissOutside, true);

    return () => {
      document.removeEventListener('keydown', dismissOnEscape);
      document.removeEventListener('pointerdown', dismissOutside, true);
    };
  }, [leafletMap, onDismiss]);

  return null;
};

export const UnpinWhenOffscreen = ({
  link,
  anchor,
  onDismiss,
}: {
  link: MapLink;
  anchor?: { x: number; y: number };
  onDismiss: () => void;
}) => {
  const leafletMap = useMap();
  const target = anchor
    ? latLngBounds([toLatLng(anchor.x, anchor.y)])
    : latLngBounds(
        toLatLng(link.x, link.y + link.height),
        toLatLng(link.x + link.width, link.y),
      );
  const dismissIfHidden = () => {
    if (!leafletMap.getBounds().intersects(target)) onDismiss();
  };

  useMapEvents({ drag: dismissIfHidden, moveend: dismissIfHidden });

  return null;
};

const INTERACTIVE =
  '.leaflet-interactive, .leaflet-marker-icon, .leaflet-control, .map-card';

export const DeselectOnEmptyClick = ({
  onDeselect,
}: {
  onDeselect: () => void;
}) => {
  useMapEvents({
    click: ({ originalEvent }) => {
      const target = originalEvent.target;

      if (target instanceof Element && target.closest(INTERACTIVE)) return;

      onDeselect();
    },
  });

  return null;
};

export const PinOnRequest = ({
  request,
  links,
  minZoom,
  onPin,
}: {
  request?: { key: string; initial?: boolean };
  links: Array<MapLink>;
  minZoom?: number;
  onPin: (link: MapLink) => void;
}) => {
  const leafletMap = useMap();
  const handled = useRef(request?.initial ? undefined : request);

  useEffect(() => {
    if (!request || handled.current === request) return;

    return whenFitSettled(leafletMap, () => {
      const link = links.find(
        (entry) =>
          entry.tooltip && [entry.highlightKey].flat().includes(request.key),
      );

      if (!link || handled.current === request) return;

      handled.current = request;

      const center = toLatLng(
        link.x + link.width / 2,
        link.y + link.height / 2,
      );
      const current = leafletMap.getZoom();
      const zoom =
        link.zoom !== undefined
          ? Math.min(link.zoom, leafletMap.getMaxZoom())
          : minZoom === undefined
            ? current
            : Math.min(Math.max(current, minZoom), leafletMap.getMaxZoom());

      if (zoom === current) {
        leafletMap.panInside(center, { padding: [96, 96] });
        onPin(link);

        return;
      }

      leafletMap.once('moveend', () => onPin(link));
      leafletMap.flyTo(center, zoom, { duration: FLIGHT_SECONDS });
    });
  }, [leafletMap, request, links, minZoom, onPin]);

  return null;
};
