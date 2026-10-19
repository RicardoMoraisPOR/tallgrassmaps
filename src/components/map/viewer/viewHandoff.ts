import { useEffect } from 'react';

import { useMap } from 'react-leaflet';

import { toLatLng } from '../coordinates';

type MapView = { x: number; y: number; zoom: number };

const HANDOFF_TTL_MS = 1500;

let latest: MapView | undefined;
let handoff: { view: MapView; at: number } | undefined;

export const handOffView = (offsetX: number, offsetY: number) => {
  handoff = latest && {
    view: { x: latest.x + offsetX, y: latest.y + offsetY, zoom: latest.zoom },
    at: Date.now(),
  };
};

const pendingView = () =>
  handoff && Date.now() - handoff.at < HANDOFF_TTL_MS
    ? handoff.view
    : undefined;

export const hasHandedOffView = () => pendingView() !== undefined;

export const RememberView = () => {
  const leafletMap = useMap();

  useEffect(() => {
    const remember = () => {
      const { lat, lng } = leafletMap.getCenter();

      latest = { x: lng, y: -lat, zoom: leafletMap.getZoom() };
    };

    remember();
    leafletMap.on('moveend', remember);

    return () => {
      leafletMap.off('moveend', remember);
    };
  }, [leafletMap]);

  return null;
};

export const RestoreHandedOffView = () => {
  const leafletMap = useMap();

  useEffect(() => {
    const view = pendingView();

    if (view && view.zoom >= leafletMap.getMinZoom())
      leafletMap.setView(toLatLng(view.x, view.y), view.zoom, {
        animate: false,
      });
  }, [leafletMap]);

  return null;
};
