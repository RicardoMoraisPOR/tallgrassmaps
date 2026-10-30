import {
  type PointerEvent,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Check,
  Copy,
  Flag,
  Magnet,
  Maximize,
  MousePointer2,
  RotateCcw,
  Route,
  Shapes,
  Tag,
  Undo2,
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
import { getLocation, getRegion } from '@/data/maps';
import { cn } from '@/lib/utils';

import { floorLayouts, stackFloors } from '../Game/Location/stackLayout';
import {
  autoLayout,
  normalized,
  type WorldPlacement,
  worldConnections,
} from './rbyWorld';

const OVERWORLD = 'overworld';
const WORLD_STORAGE_KEY = 'rby-world-layout';
const SNAP_PIXELS = 16;
const ICON_PIXELS = 16;
const MIN_SCALE = 0.05;
const MAX_SCALE = 2;
const ZOOM_STEP = 1.12;
const FIT_PADDING_PIXELS = 48;
const CLICK_TOLERANCE_PIXELS = 4;
const RESET_CONFIRM_MS = 3000;
const HISTORY_STEPS = 3;
const NUDGE_MERGE_MS = 800;
const LABEL_SCREEN_PIXELS = 11;
const LABEL_MAX_TILE_ROWS = 10;
const LABEL_MAX_TILE_COLUMNS = 7;

type Mode = 'tiles' | 'icons';

type MakerTile = {
  id: string;
  name: string;
  image: string;
  width: number;
  height: number;
};

type PlacedIcon = {
  id: string;
  tile: string;
  x: number;
  y: number;
};

type GroupOption = { id: string; label: string; section: string };

const readJson = <T,>(key: string): T | undefined => {
  try {
    const raw = localStorage.getItem(key);

    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
};

const writeJson = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
};

const layoutKey = (group: string) =>
  group === OVERWORLD ? WORLD_STORAGE_KEY : `rby-layout:${group}`;

const iconsKey = (group: string) => `rby-icons:${group}`;

const snapTo = (value: number, step: number, snap: boolean) =>
  snap ? Math.round(value / step) * step : Math.round(value);

type Snapshot = {
  group: string;
  placement: WorldPlacement;
  icons: Array<PlacedIcon>;
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

type Press = { x: number; y: number };

export const RbyMapMakerPage = () => {
  const region = getRegion('kanto-rby');
  const [mode, setMode] = useState<Mode>('tiles');
  const [group, setGroup] = useState(OVERWORLD);
  const [placements, setPlacements] = useState<Record<string, WorldPlacement>>(
    {},
  );
  const [iconSets, setIconSets] = useState<Record<string, Array<PlacedIcon>>>(
    {},
  );
  const [selected, setSelected] = useState<string>();
  const [selectedIcon, setSelectedIcon] = useState<string>();
  const [snap, setSnap] = useState(true);
  const [showConnections, setShowConnections] = useState(true);
  const [labels, setLabels] = useState(true);
  const [view, setView] = useState({ x: 40, y: 40, scale: 0.18 });
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [history, setHistory] = useState<Array<Snapshot>>([]);
  const dragRecorded = useRef(false);
  const lastNudge = useRef(0);
  const stage = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag>(undefined);
  const iconDrag = useRef<Drag>(undefined);
  const pan = useRef<Pan>(undefined);
  const press = useRef<Press>(undefined);

  const groups = useMemo<Array<GroupOption>>(() => {
    const options: Array<GroupOption> = [
      { id: OVERWORLD, label: 'Overworld', section: '' },
    ];

    for (const parent of region?.locations ?? []) {
      for (const child of parent.locations) {
        options.push({
          id: `${parent.id}/${child.id}`,
          label: child.name,
          section: parent.name,
        });
      }
    }

    return options;
  }, [region]);

  const tiles = useMemo<Array<MakerTile>>(() => {
    if (!region) return [];

    if (group === OVERWORLD)
      return region.locations
        .filter(({ id }) => worldConnections[id])
        .map(({ id, name, image, width, height }) => ({
          id,
          name,
          image,
          width,
          height,
        }));

    const location = getLocation(region, group);

    if (!location) return [];

    return location.floors?.length
      ? location.floors.map(({ id, name, image, width, height }) => ({
          id,
          name,
          image,
          width,
          height,
        }))
      : [
          {
            id: location.id,
            name: location.name,
            image: location.image,
            width: location.width,
            height: location.height,
          },
        ];
  }, [region, group]);

  const autoPlacement = useMemo<WorldPlacement>(
    () => (group === OVERWORLD ? autoLayout(tiles) : {}),
    [group, tiles],
  );

  const defaultPlacement = useMemo<WorldPlacement>(() => {
    if (group === OVERWORLD) {
      const published = region?.world ?? {};

      return Object.fromEntries(
        tiles.map(({ id }) => [id, published[id] ?? autoPlacement[id]]),
      );
    }

    const location = region && getLocation(region, group);

    if (location?.floors?.length) {
      const { floors } = stackFloors(
        location.floors,
        ({ image }) => image,
        floorLayouts[location.id],
      );

      return Object.fromEntries(floors.map(({ id, x, y }) => [id, { x, y }]));
    }

    return Object.fromEntries(tiles.map(({ id }) => [id, { x: 0, y: 0 }]));
  }, [region, group, tiles, autoPlacement]);

  const placement =
    placements[group] ??
    readJson<WorldPlacement>(layoutKey(group)) ??
    defaultPlacement;
  const icons =
    iconSets[group] ?? readJson<Array<PlacedIcon>>(iconsKey(group)) ?? [];

  const updatePlacement = (
    update: (current: WorldPlacement) => WorldPlacement,
  ) => {
    const next = update(placement);

    setPlacements((current) => ({ ...current, [group]: next }));
    writeJson(layoutKey(group), next);
  };

  const updateIcons = (
    update: (current: Array<PlacedIcon>) => Array<PlacedIcon>,
  ) => {
    const next = update(icons);

    setIconSets((current) => ({ ...current, [group]: next }));
    writeJson(iconsKey(group), next);
  };

  const recordHistory = () =>
    setHistory((current) =>
      [...current, { group, placement, icons }].slice(-HISTORY_STEPS),
    );

  const recordNudge = () => {
    const now = Date.now();

    if (now - lastNudge.current > NUDGE_MERGE_MS) recordHistory();

    lastNudge.current = now;
  };

  const lastForGroup = history.findLastIndex((entry) => entry.group === group);

  const undo = () => {
    if (lastForGroup < 0) return;

    const entry = history[lastForGroup];

    setHistory((current) =>
      current.filter((_, index) => index !== lastForGroup),
    );
    setPlacements((current) => ({ ...current, [group]: entry.placement }));
    setIconSets((current) => ({ ...current, [group]: entry.icons }));
    writeJson(layoutKey(group), entry.placement);
    writeJson(iconsKey(group), entry.icons);
    setSelectedIcon(undefined);
  };

  const data = JSON.stringify(
    group === OVERWORLD && icons.length === 0
      ? normalized(placement)
      : {
          location: group,
          tiles: normalized(placement),
          icons: icons.map(({ tile, x, y }) => ({ tile, x, y })),
        },
    null,
    2,
  );

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

  const fit = () => {
    const element = stage.current;
    const entries = tiles.map((tile) => ({ tile, at: placement[tile.id] }));

    if (!element || entries.length === 0 || entries.some(({ at }) => !at))
      return;

    const left = Math.min(...entries.map(({ at }) => at.x));
    const top = Math.min(...entries.map(({ at }) => at.y));
    const right = Math.max(...entries.map(({ tile, at }) => at.x + tile.width));
    const bottom = Math.max(
      ...entries.map(({ tile, at }) => at.y + tile.height),
    );
    const scale = Math.min(
      MAX_SCALE,
      (element.clientWidth - FIT_PADDING_PIXELS * 2) / (right - left),
      (element.clientHeight - FIT_PADDING_PIXELS * 2) / (bottom - top),
    );

    setView({
      scale,
      x: FIT_PADDING_PIXELS - left * scale,
      y: FIT_PADDING_PIXELS - top * scale,
    });
  };

  const fitOnGroupChange = useEffectEvent(fit);

  useEffect(() => {
    fitOnGroupChange();
  }, [group]);

  const [resetKey, setResetKey] = useState({ group, mode });

  if (resetKey.group !== group || resetKey.mode !== mode) {
    setResetKey({ group, mode });
    setSelected(undefined);
    setSelectedIcon(undefined);
    setConfirmReset(false);
  }

  useEffect(() => {
    if (!confirmReset) return;

    const timer = setTimeout(() => setConfirmReset(false), RESET_CONFIRM_MS);

    return () => clearTimeout(timer);
  }, [confirmReset]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      if (target?.closest('select, input, textarea')) return;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        undo();

        return;
      }

      if (mode === 'icons' && selectedIcon) {
        if (event.key === 'Delete' || event.key === 'Backspace') {
          event.preventDefault();
          recordHistory();
          updateIcons((current) =>
            current.filter(({ id }) => id !== selectedIcon),
          );
          setSelectedIcon(undefined);

          return;
        }

        const step = event.shiftKey ? 1 : ICON_PIXELS;
        const delta = {
          ArrowLeft: [-step, 0],
          ArrowRight: [step, 0],
          ArrowUp: [0, -step],
          ArrowDown: [0, step],
        }[event.key];

        if (!delta) return;

        event.preventDefault();
        recordNudge();
        updateIcons((current) =>
          current.map((icon) =>
            icon.id === selectedIcon
              ? { ...icon, x: icon.x + delta[0], y: icon.y + delta[1] }
              : icon,
          ),
        );

        return;
      }

      if (mode !== 'tiles' || !selected) return;

      const step = event.shiftKey ? 1 : SNAP_PIXELS;
      const delta = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      }[event.key];

      if (!delta) return;

      event.preventDefault();
      recordNudge();
      updatePlacement((current) => ({
        ...current,
        [selected]: {
          x: current[selected].x + delta[0],
          y: current[selected].y + delta[1],
        },
      }));
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const startTileDrag = (event: PointerEvent, id: string) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelected(id);
    dragRecorded.current = false;
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
    setSelectedIcon(undefined);
    press.current = { x: event.clientX, y: event.clientY };
    pan.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      startX: view.x,
      startY: view.y,
    };
  };

  const startIconDrag = (event: PointerEvent, icon: PlacedIcon) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedIcon(icon.id);
    dragRecorded.current = false;
    iconDrag.current = {
      id: icon.id,
      pointerX: event.clientX,
      pointerY: event.clientY,
      startX: icon.x,
      startY: icon.y,
    };
  };

  const placeIconAt = (clientX: number, clientY: number) => {
    const element = stage.current;

    if (!element) return;

    const box = element.getBoundingClientRect();
    const worldX = (clientX - box.left - view.x) / view.scale;
    const worldY = (clientY - box.top - view.y) / view.scale;
    const tile = tiles.find((entry) => {
      const at = placement[entry.id];

      return (
        at &&
        worldX >= at.x &&
        worldX < at.x + entry.width &&
        worldY >= at.y &&
        worldY < at.y + entry.height
      );
    });

    if (!tile) return;

    const at = placement[tile.id];
    const floorTo = (value: number) =>
      snap
        ? Math.floor(value / ICON_PIXELS) * ICON_PIXELS
        : Math.round(value - ICON_PIXELS / 2);
    const icon: PlacedIcon = {
      id: crypto.randomUUID(),
      tile: tile.id,
      x: Math.max(
        0,
        Math.min(tile.width - ICON_PIXELS, floorTo(worldX - at.x)),
      ),
      y: Math.max(
        0,
        Math.min(tile.height - ICON_PIXELS, floorTo(worldY - at.y)),
      ),
    };

    recordHistory();
    updateIcons((current) => [...current, icon]);
    setSelectedIcon(icon.id);
  };

  const onPointerMove = (event: PointerEvent) => {
    const moving = drag.current;
    const movingIcon = iconDrag.current;
    const panning = pan.current;

    if (moving) {
      const x = snapTo(
        moving.startX + (event.clientX - moving.pointerX) / view.scale,
        SNAP_PIXELS,
        snap,
      );
      const y = snapTo(
        moving.startY + (event.clientY - moving.pointerY) / view.scale,
        SNAP_PIXELS,
        snap,
      );

      if (
        !dragRecorded.current &&
        (x !== moving.startX || y !== moving.startY)
      ) {
        dragRecorded.current = true;
        recordHistory();
      }

      updatePlacement((current) => ({
        ...current,
        [moving.id]: {
          x: snapTo(
            moving.startX + (event.clientX - moving.pointerX) / view.scale,
            SNAP_PIXELS,
            snap,
          ),
          y: snapTo(
            moving.startY + (event.clientY - moving.pointerY) / view.scale,
            SNAP_PIXELS,
            snap,
          ),
        },
      }));
    } else if (movingIcon) {
      const x = snapTo(
        movingIcon.startX + (event.clientX - movingIcon.pointerX) / view.scale,
        ICON_PIXELS,
        snap,
      );
      const y = snapTo(
        movingIcon.startY + (event.clientY - movingIcon.pointerY) / view.scale,
        ICON_PIXELS,
        snap,
      );

      if (
        !dragRecorded.current &&
        (x !== movingIcon.startX || y !== movingIcon.startY)
      ) {
        dragRecorded.current = true;
        recordHistory();
      }

      updateIcons((current) =>
        current.map((icon) =>
          icon.id === movingIcon.id
            ? {
                ...icon,
                x: snapTo(
                  movingIcon.startX +
                    (event.clientX - movingIcon.pointerX) / view.scale,
                  ICON_PIXELS,
                  snap,
                ),
                y: snapTo(
                  movingIcon.startY +
                    (event.clientY - movingIcon.pointerY) / view.scale,
                  ICON_PIXELS,
                  snap,
                ),
              }
            : icon,
        ),
      );
    } else if (panning) {
      setView((current) => ({
        ...current,
        x: panning.startX + event.clientX - panning.pointerX,
        y: panning.startY + event.clientY - panning.pointerY,
      }));
    }
  };

  const endPointer = (event: PointerEvent) => {
    const start = press.current;

    press.current = undefined;

    if (
      mode === 'icons' &&
      start &&
      !iconDrag.current &&
      Math.hypot(event.clientX - start.x, event.clientY - start.y) <=
        CLICK_TOLERANCE_PIXELS
    )
      placeIconAt(event.clientX, event.clientY);

    drag.current = undefined;
    iconDrag.current = undefined;
    pan.current = undefined;
  };

  const reset = () => {
    if (!confirmReset) {
      setConfirmReset(true);

      return;
    }

    setConfirmReset(false);
    recordHistory();

    if (mode === 'tiles') {
      setPlacements((current) => ({ ...current, [group]: defaultPlacement }));

      try {
        localStorage.removeItem(layoutKey(group));
      } catch {
        return;
      }

      return;
    }

    setIconSets((current) => ({ ...current, [group]: [] }));
    setSelectedIcon(undefined);

    try {
      localStorage.removeItem(iconsKey(group));
    } catch {
      return;
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const sections = [...new Set(groups.map(({ section }) => section))];

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

            if (!at) return null;

            const isSelected = mode === 'tiles' && tile.id === selected;

            return (
              <div
                key={tile.id}
                onPointerDown={
                  mode === 'tiles'
                    ? (event) => startTileDrag(event, tile.id)
                    : undefined
                }
                className={cn(
                  'absolute bg-background',
                  mode === 'tiles' ? 'cursor-move' : 'cursor-crosshair',
                )}
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
                {icons
                  .filter((icon) => icon.tile === tile.id)
                  .map((icon) => (
                    <span
                      key={icon.id}
                      title="Icon"
                      onPointerDown={
                        mode === 'icons'
                          ? (event) => startIconDrag(event, icon)
                          : undefined
                      }
                      className={cn(
                        'absolute grid place-items-center border-2 border-[#292929] bg-[#f6f4f7]',
                        mode === 'icons'
                          ? 'cursor-move'
                          : 'pointer-events-none opacity-60',
                        icon.id === selectedIcon &&
                          'outline-2 outline-offset-1 outline-brand',
                      )}
                      style={{
                        left: icon.x,
                        top: icon.y,
                        width: ICON_PIXELS,
                        height: ICON_PIXELS,
                        zIndex: icon.id === selectedIcon ? 20 : 5,
                      }}
                    >
                      <span className="size-1/2 bg-[#292929]" />
                    </span>
                  ))}
                {labels && (
                  <span
                    className="pointer-events-none absolute top-0 left-0 max-w-full truncate bg-foreground/80 px-[0.5em] py-[0.15em] font-semibold whitespace-nowrap text-background"
                    style={{
                      fontSize: Math.min(
                        LABEL_SCREEN_PIXELS / view.scale,
                        tile.height / LABEL_MAX_TILE_ROWS,
                        tile.width / LABEL_MAX_TILE_COLUMNS,
                      ),
                    }}
                  >
                    {tile.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="pointer-events-none absolute top-3 left-3 z-[1100] flex flex-wrap items-center gap-2">
        <div
          role="group"
          aria-label="Mode"
          className="pointer-events-auto flex gap-1 rounded-sm border bg-card/95 p-1 shadow-sm"
        >
          <Button
            size="sm"
            variant={mode === 'tiles' ? 'default' : 'ghost'}
            aria-pressed={mode === 'tiles'}
            onClick={() => setMode('tiles')}
          >
            <MousePointer2 /> Tiles
          </Button>
          <Button
            size="sm"
            variant={mode === 'icons' ? 'default' : 'ghost'}
            aria-pressed={mode === 'icons'}
            onClick={() => setMode('icons')}
          >
            <Shapes /> Icons
          </Button>
        </div>
        <select
          aria-label="Location"
          value={group}
          onChange={(event) => setGroup(event.target.value)}
          className="pointer-events-auto h-9 rounded-sm border bg-card/95 px-2 text-sm shadow-sm"
        >
          {sections.map((section) => (
            <optgroup key={section} label={section || 'World'}>
              {groups
                .filter((option) => option.section === section)
                .map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
        <Button
          variant="outline"
          onClick={undo}
          disabled={lastForGroup < 0}
          title="Undo (Ctrl+Z)"
          className="pointer-events-auto bg-background"
        >
          <Undo2 /> Undo
        </Button>
        <Button
          variant={confirmReset ? 'destructive' : 'outline'}
          onClick={reset}
          className="pointer-events-auto bg-background"
        >
          <RotateCcw />
          {confirmReset
            ? `Click again to reset ${mode === 'tiles' ? 'tiles' : 'icons'}`
            : 'Reset'}
        </Button>
      </div>
      <div className="pointer-events-none absolute right-3 bottom-3 left-3 z-[1100] flex flex-wrap items-center justify-end gap-2">
        <p className="pointer-events-auto mr-auto rounded-sm bg-background/90 px-3 py-1.5 text-sm shadow ring-1 ring-foreground/10">
          {mode === 'tiles'
            ? `Drag a tile to place it, drag the background to pan, scroll to zoom. Arrow keys nudge the selected tile (${SNAP_PIXELS}px, or 1px with Shift).`
            : 'Click a tile to drop an icon, drag an icon to move it, Delete removes the selected one.'}{' '}
          <span className="font-semibold">
            {mode === 'icons'
              ? `${icons.length} icons`
              : selected && placement[selected]
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
          variant={labels ? 'default' : 'outline'}
          aria-pressed={labels}
          onClick={() => setLabels((current) => !current)}
          className="pointer-events-auto"
        >
          <Tag /> Labels
        </Button>
        {group === OVERWORLD && (
          <Button
            variant={showConnections ? 'default' : 'outline'}
            aria-pressed={showConnections}
            onClick={() => setShowConnections((current) => !current)}
            className="pointer-events-auto"
          >
            <Route /> Connections
          </Button>
        )}
        <Button
          variant="outline"
          onClick={fit}
          className="pointer-events-auto bg-background"
        >
          <Maximize /> Fit
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            recordHistory();
            updatePlacement(() => ({
              ...(group === OVERWORLD ? autoPlacement : defaultPlacement),
            }));
          }}
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
            <DialogTitle>
              {group === OVERWORLD && icons.length === 0
                ? 'Tile positions'
                : 'Layout and icons'}
            </DialogTitle>
            <DialogDescription>
              {tiles.length} tiles, top-left corner of each in map pixels
              {icons.length > 0
                ? `, plus ${icons.length} icons in tile pixels`
                : ''}
              . Copy this and send it over.
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
