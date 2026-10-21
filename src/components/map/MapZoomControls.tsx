import { useEffect, useRef, useState } from 'react';

import { DomEvent, type LatLngBoundsLiteral, latLngBounds } from 'leaflet';
import { Box, Focus, LocateFixed, Minus, Plus } from 'lucide-react';
import { useMap, useMapEvents } from 'react-leaflet';

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { TABLET_QUERY } from '@/lib/breakpoints';
import { cn } from '@/lib/utils';

import { toLatLng } from './coordinates';
import { FLIGHT_PADDING_PIXELS, FLIGHT_SECONDS } from './viewer/FloorFrames';

export type ZoomPosition = 'topleft' | 'bottomleft';

const BUTTON_HEIGHT = 37;
const EDGE_GAP = '0.75rem';

const topFor = (position: ZoomPosition, buttons: number) =>
  position === 'topleft'
    ? EDGE_GAP
    : `calc(100% - ${buttons * BUTTON_HEIGHT + 1}px - ${EDGE_GAP})`;

const SHIFT_ZOOM_DELTA = 3;

const buttonClass =
  'flex size-9 items-center justify-center text-muted-foreground transition-[color,scale] outline-none active:scale-97 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40';

type Area = { x: number; y: number; width: number; height: number };

type Toggle = { on: boolean; onToggle: () => void };

const activeClass =
  'bg-brand text-[oklch(0.2_0.03_160)] hover:text-[oklch(0.2_0.03_160)]';

type MapZoomControlsProps = {
  position: ZoomPosition;
  worldView?: Toggle;
  recenterOn?: Area;
  tilt?: Toggle;
};

export const MapZoomControls = ({
  position,
  recenterOn,
  worldView,
  tilt,
}: MapZoomControlsProps) => {
  const map = useMap();
  const vertical = useMediaQuery(TABLET_QUERY);
  const container = useRef<HTMLDivElement>(null);
  const [limits, setLimits] = useState(() => zoomLimits(map));

  useMapEvents({
    zoomend: () => setLimits(zoomLimits(map)),
    zoomlevelschange: () => setLimits(zoomLimits(map)),
  });

  useEffect(() => {
    if (!container.current) return;

    DomEvent.disableClickPropagation(container.current);
    DomEvent.disableScrollPropagation(container.current);
  }, []);

  return (
    <div
      ref={container}
      style={{
        top: topFor(
          position,
          vertical ? 3 + Number(Boolean(worldView)) + Number(Boolean(tilt)) : 1,
        ),
        left: EDGE_GAP,
      }}
      className={cn(
        'absolute z-1000 flex overflow-hidden rounded-sm border bg-card transition-[top] duration-250 ease-out',
        vertical ? 'flex-col divide-y' : 'flex-row divide-x',
      )}
    >
      <button
        type="button"
        aria-label="Zoom in"
        title="Zoom in"
        disabled={!limits.canZoomIn}
        onClick={(event) => map.zoomIn(event.shiftKey ? SHIFT_ZOOM_DELTA : 1)}
        className={buttonClass}
      >
        <Plus aria-hidden className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Zoom out"
        title="Zoom out"
        disabled={!limits.canZoomOut}
        onClick={(event) => map.zoomOut(event.shiftKey ? SHIFT_ZOOM_DELTA : 1)}
        className={buttonClass}
      >
        <Minus aria-hidden className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Recenter map"
        title="Recenter map"
        onClick={() => recenter(map, recenterOn)}
        className={buttonClass}
      >
        <LocateFixed aria-hidden className="size-4" />
      </button>
      {worldView && (
        <button
          type="button"
          aria-label="Focus view"
          aria-pressed={worldView.on}
          title="Focus view"
          onClick={worldView.onToggle}
          className={cn(buttonClass, worldView.on && activeClass)}
        >
          <Focus aria-hidden className="size-4" />
        </button>
      )}
      {tilt && (
        <button
          type="button"
          aria-label="Tilt map"
          aria-pressed={tilt.on}
          title="Tilt map"
          onClick={tilt.onToggle}
          className={cn(buttonClass, tilt.on && activeClass)}
        >
          <Box aria-hidden className="size-4" />
        </button>
      )}
    </div>
  );
};

const recenter = (map: ReturnType<typeof useMap>, area?: Area) => {
  if (area) {
    map.flyToBounds(
      [
        toLatLng(area.x, area.y + area.height),
        toLatLng(area.x + area.width, area.y),
      ],
      {
        padding: [FLIGHT_PADDING_PIXELS, FLIGHT_PADDING_PIXELS],
        duration: FLIGHT_SECONDS,
      },
    );

    return;
  }

  const { maxBounds } = map.options;

  map.flyTo(
    maxBounds
      ? latLngBounds(maxBounds as LatLngBoundsLiteral).getCenter()
      : map.getCenter(),
    map.getMinZoom(),
    { duration: FLIGHT_SECONDS },
  );
};

const zoomLimits = (map: ReturnType<typeof useMap>) => ({
  canZoomIn: map.getZoom() < map.getMaxZoom(),
  canZoomOut: map.getZoom() > map.getMinZoom(),
});
