import { Box, Focus, LocateFixed, Minus, Palette, Plus } from 'lucide-react';

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { TABLET_QUERY } from '@/lib/breakpoints';
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

export type ZoomArea = { x: number; y: number; width: number; height: number };

type Toggle = { on: boolean; onToggle: () => void };

const activeClass =
  'bg-brand text-[oklch(0.2_0.03_160)] hover:text-[oklch(0.2_0.03_160)]';

export type ZoomToggle = Toggle;

export type ZoomLimits = { canZoomIn: boolean; canZoomOut: boolean };

type ZoomControlsViewProps = {
  position: ZoomPosition;
  limits: ZoomLimits;
  onZoomIn: (delta: number) => void;
  onZoomOut: (delta: number) => void;
  onRecenter: () => void;
  worldView?: Toggle;
  tilt?: Toggle;
  colors?: Toggle;
  containerRef?: React.Ref<HTMLDivElement>;
};

export const ZoomControlsView = ({
  position,
  limits,
  onZoomIn,
  onZoomOut,
  onRecenter,
  worldView,
  tilt,
  colors,
  containerRef,
}: ZoomControlsViewProps) => {
  const vertical = useMediaQuery(TABLET_QUERY);

  return (
    <div
      ref={containerRef}
      style={{
        top: topFor(
          position,
          vertical
            ? 3 +
                Number(Boolean(worldView)) +
                Number(Boolean(tilt)) +
                Number(Boolean(colors))
            : 1,
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
        onClick={(event) => onZoomIn(event.shiftKey ? SHIFT_ZOOM_DELTA : 1)}
        className={buttonClass}
      >
        <Plus aria-hidden className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Zoom out"
        title="Zoom out"
        disabled={!limits.canZoomOut}
        onClick={(event) => onZoomOut(event.shiftKey ? SHIFT_ZOOM_DELTA : 1)}
        className={buttonClass}
      >
        <Minus aria-hidden className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Recenter map"
        title="Recenter map"
        onClick={onRecenter}
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
      {colors && (
        <button
          type="button"
          aria-label="Game Boy Color colours"
          aria-pressed={colors.on}
          title="Game Boy Color colours"
          onClick={colors.onToggle}
          className={cn(buttonClass, colors.on && activeClass)}
        >
          <Palette aria-hidden className="size-4" />
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
