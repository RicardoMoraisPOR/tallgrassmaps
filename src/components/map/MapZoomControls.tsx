import { useEffect, useRef, useState } from 'react';

import { DomEvent } from 'leaflet';
import { Box, Minus, Plus } from 'lucide-react';
import { useMap, useMapEvents } from 'react-leaflet';

import { cn } from '@/lib/utils';

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

type MapZoomControlsProps = {
  position: ZoomPosition;
  tilt?: { on: boolean; onToggle: () => void };
};

export const MapZoomControls = ({ position, tilt }: MapZoomControlsProps) => {
  const map = useMap();
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
      style={{ top: topFor(position, tilt ? 3 : 2), left: EDGE_GAP }}
      className="absolute z-1000 flex flex-col divide-y overflow-hidden rounded-sm border bg-card transition-[top] duration-250 ease-out"
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
      {tilt && (
        <button
          type="button"
          aria-label="Tilt map"
          aria-pressed={tilt.on}
          title="Tilt map"
          onClick={tilt.onToggle}
          className={cn(buttonClass, tilt.on && 'bg-muted text-foreground')}
        >
          <Box aria-hidden className="size-4" />
        </button>
      )}
    </div>
  );
};

const zoomLimits = (map: ReturnType<typeof useMap>) => ({
  canZoomIn: map.getZoom() < map.getMaxZoom(),
  canZoomOut: map.getZoom() > map.getMinZoom(),
});
