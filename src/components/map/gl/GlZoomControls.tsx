import { useEffect, useState } from 'react';

import type { Map as MapLibreMap } from 'maplibre-gl';

import {
  type ZoomArea,
  ZoomControlsView,
  type ZoomPosition,
  type ZoomToggle,
} from '../MapZoomControls';
import { rectBounds, toLngLat } from './glCoordinates';

const FLIGHT_PADDING_PIXELS = 24;
const FIT_PADDING_PIXELS = 48;
const FLIGHT_MS = 700;
const STEP_MS = 250;

type GlZoomControlsProps = {
  map: MapLibreMap;
  width: number;
  height: number;
  position: ZoomPosition;
  recenterOn?: ZoomArea;
  worldView?: ZoomToggle;
  tilt?: ZoomToggle;
  colors?: ZoomToggle;
};

const limitsOf = (map: MapLibreMap) => ({
  canZoomIn: map.getZoom() < map.getMaxZoom() - 0.01,
  canZoomOut: map.getZoom() > map.getMinZoom() + 0.01,
});

export const GlZoomControls = ({
  map,
  width,
  height,
  position,
  recenterOn,
  worldView,
  tilt,
  colors,
}: GlZoomControlsProps) => {
  const [limits, setLimits] = useState(() => limitsOf(map));

  useEffect(() => {
    const update = () => setLimits(limitsOf(map));

    map.on('zoomend', update);
    map.on('moveend', update);
    update();

    return () => {
      map.off('zoomend', update);
      map.off('moveend', update);
    };
  }, [map]);

  const zoomBy = (delta: number) =>
    map.zoomTo(Math.round(map.getZoom()) + delta, { duration: STEP_MS });

  const recenter = () => {
    if (recenterOn) {
      map.fitBounds(
        rectBounds(
          recenterOn.x,
          recenterOn.y,
          recenterOn.width,
          recenterOn.height,
        ),
        { padding: FLIGHT_PADDING_PIXELS, duration: FLIGHT_MS },
      );

      return;
    }

    map.fitBounds([toLngLat(0, height), toLngLat(width, 0)], {
      padding: FIT_PADDING_PIXELS,
      duration: FLIGHT_MS,
    });
  };

  return (
    <ZoomControlsView
      position={position}
      limits={limits}
      onZoomIn={zoomBy}
      onZoomOut={(delta) => zoomBy(-delta)}
      onRecenter={recenter}
      worldView={worldView}
      tilt={tilt}
      colors={colors}
    />
  );
};
