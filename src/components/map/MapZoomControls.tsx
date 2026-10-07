import { useEffect, useRef, useState } from 'react';

import { DomEvent } from 'leaflet';
import { Minus, Plus } from 'lucide-react';
import { useMap, useMapEvents } from 'react-leaflet';

export type ZoomPosition = 'topleft' | 'bottomleft';

const CONTROLS_HEIGHT = '75px';
const EDGE_GAP = '0.75rem';

const TOPS: Record<ZoomPosition, string> = {
  topleft: EDGE_GAP,
  bottomleft: `calc(100% - ${CONTROLS_HEIGHT} - ${EDGE_GAP})`,
};

const SHIFT_ZOOM_DELTA = 3;

const buttonClass =
  'flex size-9 items-center justify-center text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40';

type MapZoomControlsProps = {
  position: ZoomPosition;
};

export const MapZoomControls = ({ position }: MapZoomControlsProps) => {
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
      style={{ top: TOPS[position], left: EDGE_GAP }}
      className="absolute z-1000 flex flex-col divide-y overflow-hidden rounded-[14px] border bg-card transition-[top] duration-500 ease-out"
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
    </div>
  );
};

const zoomLimits = (map: ReturnType<typeof useMap>) => ({
  canZoomIn: map.getZoom() < map.getMaxZoom(),
  canZoomOut: map.getZoom() > map.getMinZoom(),
});
