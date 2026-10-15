import { type PointerEvent, useEffect, useMemo, useRef, useState } from 'react';

import {
  Check,
  Copy,
  Flag,
  Magnet,
  Maximize,
  Route,
  Wand2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getRegion } from '@/data/maps';

import {
  autoLayout,
  normalized,
  type WorldPlacement,
  worldConnections,
} from './rbyWorld';

const STORAGE_KEY = 'rby-world-layout';
const SNAP_PIXELS = 16;
const MIN_SCALE = 0.05;
const MAX_SCALE = 2;
const ZOOM_STEP = 1.12;
const FIT_PADDING_PIXELS = 48;

const loadSaved = (): WorldPlacement | undefined => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    return raw ? (JSON.parse(raw) as WorldPlacement) : undefined;
  } catch {
    return undefined;
  }
};

type Drag = {
  id: string;
  pointerX: number;
  pointerY: number;
  startX: number;
  startY: number;
};

type Pan = {
  pointerX: number;
  pointerY: number;
  startX: number;
  startY: number;
};

export const RbyMapMakerPage = () => {
  const region = getRegion('kanto-rby');
  const tiles = useMemo(
    () =>
      (region?.locations ?? [])
        .filter(({ id }) => worldConnections[id])
        .map(({ id, name, image, width, height }) => ({
          id,
          name,
          image,
          width,
          height,
        })),
    [region],
  );
  const [placement, setPlacement] = useState<WorldPlacement>(
    () => loadSaved() ?? autoLayout(tiles),
  );
  const [selected, setSelected] = useState<string>();
  const [snap, setSnap] = useState(true);
  const [showConnections, setShowConnections] = useState(true);
  const [view, setView] = useState({ x: 40, y: 40, scale: 0.18 });
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag>(undefined);
  const pan = useRef<Pan>(undefined);

  const data = JSON.stringify(normalized(placement), null, 2);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(placement));
    } catch {
      return;
    }
  }, [placement]);

  useEffect(() => {
    const element = stage.current;

    if (!element) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();

      const box = element.getBoundingClientRect();
      const pointerX = event.clientX - box.left;
      const pointerY = event.clientY - box.top;

      setView((current) => {
        const scale = Math.min(
          MAX_SCALE,
          Math.max(
            MIN_SCALE,
            current.scale * (event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP),
          ),
        );
        const ratio = scale / current.scale;

        return {
          scale,
          x: pointerX - (pointerX - current.x) * ratio,
          y: pointerY - (pointerY - current.y) * ratio,
        };
      });
    };

    element.addEventListener('wheel', onWheel, { passive: false });

    return () => element.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const step = event.shiftKey ? 1 : SNAP_PIXELS;
      const delta = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      }[event.key];

      if (!selected || !delta) return;

      event.preventDefault();
      setPlacement((current) => ({
        ...current,
        [selected]: {
          x: current[selected].x + delta[0],
          y: current[selected].y + delta[1],
        },
      }));
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected]);

  const fit = () => {
    const element = stage.current;
    const entries = tiles.map((tile) => ({ tile, at: placement[tile.id] }));

    if (!element || entries.length === 0) return;

    const left = Math.min(...entries.map(({ at }) => at.x));
    const top = Math.min(...entries.map(({ at }) => at.y));
    const right = Math.max(...entries.map(({ tile, at }) => at.x + tile.width));
    const bottom = Math.max(
      ...entries.map(({ tile, at }) => at.y + tile.height),
    );
    const scale = Math.min(
      (element.clientWidth - FIT_PADDING_PIXELS * 2) / (right - left),
      (element.clientHeight - FIT_PADDING_PIXELS * 2) / (bottom - top),
    );

    setView({
      scale,
      x: FIT_PADDING_PIXELS - left * scale,
      y: FIT_PADDING_PIXELS - top * scale,
    });
  };

  const startTileDrag = (event: PointerEvent, id: string) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelected(id);
    drag.current = {
      id,
      pointerX: event.clientX,
      pointerY: event.clientY,
      startX: placement[id].x,
      startY: placement[id].y,
    };
  };

  const startPan = (event: PointerEvent) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelected(undefined);
    pan.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      startX: view.x,
      startY: view.y,
    };
  };

  const onPointerMove = (event: PointerEvent) => {
    const moving = drag.current;
    const panning = pan.current;

    if (moving) {
      const snapTo = (value: number) =>
        snap
          ? Math.round(value / SNAP_PIXELS) * SNAP_PIXELS
          : Math.round(value);

      setPlacement((current) => ({
        ...current,
        [moving.id]: {
          x: snapTo(
            moving.startX + (event.clientX - moving.pointerX) / view.scale,
          ),
          y: snapTo(
            moving.startY + (event.clientY - moving.pointerY) / view.scale,
          ),
        },
      }));
    } else if (panning) {
      setView((current) => ({
        ...current,
        x: panning.startX + event.clientX - panning.pointerX,
        y: panning.startY + event.clientY - panning.pointerY,
      }));
    }
  };

  const endPointer = () => {
    drag.current = undefined;
    pan.current = undefined;
  };

  const copy = async () => {
    await navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative h-[calc(100svh-3.5rem)] overflow-hidden bg-muted">
      <div
        ref={stage}
        className="absolute inset-0 cursor-grab touch-none select-none active:cursor-grabbing"
        onPointerDown={startPan}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
      >
        <div
          className="absolute top-0 left-0 origin-top-left"
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
          }}
        >
          {tiles.map((tile) => {
            const at = placement[tile.id];
            const isSelected = tile.id === selected;

            return (
              <div
                key={tile.id}
                onPointerDown={(event) => startTileDrag(event, tile.id)}
                className="absolute cursor-move bg-background"
                style={{
                  left: at.x,
                  top: at.y,
                  width: tile.width,
                  height: tile.height,
                  zIndex: isSelected ? 10 : 0,
                  outline: `${isSelected ? 6 : 2}px solid ${isSelected ? 'var(--brand)' : 'color-mix(in oklab, var(--foreground) 40%, transparent)'}`,
                  outlineOffset: -1,
                }}
              >
                <img
                  src={tile.image}
                  alt=""
                  draggable={false}
                  className="pointer-events-none size-full [image-rendering:pixelated]"
                />
                {showConnections &&
                  (worldConnections[tile.id] ?? []).map(({ to, area }) => (
                    <div
                      key={to}
                      title={to}
                      className="pointer-events-none absolute border-2 border-red-500 bg-red-500/40"
                      style={{
                        left: area.x,
                        top: area.y,
                        width: area.width,
                        height: area.height,
                      }}
                    />
                  ))}
                <span
                  className="pointer-events-none absolute top-0 left-0 bg-foreground px-3 py-1 font-semibold text-background"
                  style={{ fontSize: 28 }}
                >
                  {tile.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="pointer-events-none absolute right-3 bottom-3 left-3 z-[1100] flex flex-wrap items-center justify-end gap-2">
        <p className="pointer-events-auto mr-auto rounded-sm bg-background/90 px-3 py-1.5 text-sm shadow ring-1 ring-foreground/10">
          Drag a tile to place it, drag the background to pan, scroll to zoom.
          Arrow keys nudge the selected tile ({SNAP_PIXELS}px, or 1px with
          Shift).{' '}
          <span className="font-semibold">
            {selected
              ? `${selected} at ${placement[selected].x}, ${placement[selected].y}`
              : `${tiles.length} tiles`}
          </span>
        </p>
        <Button
          variant={snap ? 'default' : 'outline'}
          aria-pressed={snap}
          onClick={() => setSnap((current) => !current)}
          className="pointer-events-auto"
        >
          <Magnet /> Snap to {SNAP_PIXELS}px
        </Button>
        <Button
          variant={showConnections ? 'default' : 'outline'}
          aria-pressed={showConnections}
          onClick={() => setShowConnections((current) => !current)}
          className="pointer-events-auto"
        >
          <Route /> Connections
        </Button>
        <Button
          variant="outline"
          onClick={fit}
          className="pointer-events-auto bg-background"
        >
          <Maximize /> Fit
        </Button>
        <Button
          variant="outline"
          onClick={() => setPlacement(autoLayout(tiles))}
          className="pointer-events-auto bg-background"
        >
          <Wand2 /> Auto layout
        </Button>
        <Button onClick={() => setOpen(true)} className="pointer-events-auto">
          <Flag /> Finish
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tile positions</DialogTitle>
            <DialogDescription>
              {tiles.length} tiles, top-left corner of each in map pixels. Copy
              this and send it over.
            </DialogDescription>
          </DialogHeader>
          <textarea
            readOnly
            value={data}
            onFocus={(event) => event.currentTarget.select()}
            className="h-64 w-full resize-none rounded-sm border bg-muted/40 p-2 font-mono text-xs"
          />
          <Button onClick={copy}>
            {copied ? <Check /> : <Copy />} {copied ? 'Copied' : 'Copy data'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
