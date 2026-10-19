import { useEffect, useRef } from 'react';

import { latLngBounds } from 'leaflet';
import { useMap, useMapEvents } from 'react-leaflet';

import { toLatLng } from '../coordinates';
import type { MapLink } from './types';

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

export const PinOnRequest = ({
  request,
  links,
  onPin,
}: {
  request?: { key: string; initial?: boolean };
  links: Array<MapLink>;
  onPin: (link: MapLink) => void;
}) => {
  const leafletMap = useMap();
  const handled = useRef(request?.initial ? undefined : request);

  useEffect(() => {
    if (!request || handled.current === request) return;

    handled.current = request;

    const link = links.find(
      (entry) =>
        entry.tooltip && [entry.highlightKey].flat().includes(request.key),
    );

    if (!link) return;

    leafletMap.panInside(
      toLatLng(link.x + link.width / 2, link.y + link.height / 2),
      { padding: [96, 96] },
    );
    onPin(link);
  }, [leafletMap, request, links, onPin]);

  return null;
};
