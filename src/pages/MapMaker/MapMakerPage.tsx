import { useEffect, useMemo, useRef, useState } from 'react';

import {
  Check,
  Circle,
  Copy,
  Eraser,
  Flag,
  Hexagon,
  MapPin,
  Magnet,
  MousePointerClick,
  Plus,
  Undo2,
} from 'lucide-react';
import {
  type GeoJSONSource,
  Map as MapLibreMap,
  type MapMouseEvent,
  Marker,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import {
  BASE_ZOOM,
  fromLngLat,
  rectBounds,
  toGlZoom,
  toLngLat,
} from '@/components/map/gl/glCoordinates';
import { GlFloorImages } from '@/components/map/gl/GlFloorImages';
import { addAnchors } from '@/components/map/gl/glLayers';
import '@/components/map/gl/glWorker';
import { GlZoomControls } from '@/components/map/gl/GlZoomControls';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getRegion } from '@/data/maps';

import { MapMakerSwitcher } from './MapMakerSwitcher';

type Point = [number, number];
type Mode = 'polygon' | 'circle' | 'points';
type PointStyle = 'free' | 'snap';

const REGION_ID = 'lumiose-za';
const START_CENTER: Point = [2450, 3820];
const START_ZOOM = 0;
const MIN_ZOOM = -3;
const MAX_ZOOM = 4;
const SHAPE_COLOR = '#07b85e';
const ANCHOR_TOLERANCE_PX = 14;
const toolbarButton =
  'pointer-events-auto bg-background hover:bg-muted dark:bg-background dark:hover:bg-muted';
const activeToolbarButton = 'pointer-events-auto hover:bg-primary';
const CIRCLE_STEPS = 48;

const pointElement = () => {
  const element = document.createElement('span');

  element.className = 'map-maker-point';
  element.style.cssText =
    'display:block;width:12px;height:12px;border-radius:9999px;background:#fff;border:2px solid #07b85e;box-shadow:0 0 0 1px #0004;cursor:grab';

  return element;
};

const MODES: Array<{ id: Mode; label: string; Icon: typeof Hexagon }> = [
  { id: 'polygon', label: 'Polygon', Icon: Hexagon },
  { id: 'circle', label: 'Circle', Icon: Circle },
  { id: 'points', label: 'Points', Icon: MapPin },
];

const POINT_STYLES: Array<{
  id: PointStyle;
  label: string;
  Icon: typeof Hexagon;
}> = [
  { id: 'snap', label: 'Snap to shapes', Icon: Magnet },
  { id: 'free', label: 'Place anywhere', Icon: MousePointerClick },
];

const radiusOf = ([cx, cy]: Point, [ex, ey]: Point) =>
  Math.round(Math.hypot(ex - cx, ey - cy));

const circleOutline = (center: Point, radius: number): Array<Point> =>
  Array.from({ length: CIRCLE_STEPS }, (_, step) => {
    const angle = (step / CIRCLE_STEPS) * Math.PI * 2;

    return [
      Math.round(center[0] + Math.cos(angle) * radius),
      Math.round(center[1] + Math.sin(angle) * radius),
    ];
  });

const formatPoints = (points: Array<Point>) =>
  `[\n${points.map(([x, y]) => `  [${x}, ${y}],`).join('\n')}\n]`;

const nearestEdge = (points: Array<Point>, [px, py]: Point) => {
  const edges = points.length >= 3 ? points.length : points.length - 1;
  let best: { index: number; point: Point; distance: number } | undefined;

  for (let i = 0; i < edges; i++) {
    const [ax, ay] = points[i];
    const [bx, by] = points[(i + 1) % points.length];
    const dx = bx - ax;
    const dy = by - ay;
    const lengthSquared = dx * dx + dy * dy;
    const t =
      lengthSquared === 0
        ? 0
        : Math.max(
            0,
            Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared),
          );
    const x = ax + t * dx;
    const y = ay + t * dy;
    const distance = Math.hypot(px - x, py - y);

    if (!best || distance < best.distance) {
      best = { index: i + 1, point: [Math.round(x), Math.round(y)], distance };
    }
  }

  return best;
};

const nearestBorder = (shapes: Array<Array<Point>>, point: Point) =>
  shapes
    .map((outline) => nearestEdge(outline, point))
    .reduce<ReturnType<typeof nearestEdge>>(
      (best, edge) =>
        !best || (edge && edge.distance < best.distance) ? edge : best,
      undefined,
    );

type MakerMapProps = {
  region: NonNullable<ReturnType<typeof getRegion>>;
  points: Array<Point>;
  shape: Array<Point>;
  references: Array<{ target: string; outline: Array<Point> }>;
  showReference: boolean;
  selecting: boolean;
  onAdd: (point: Point, unitsPerPixel: number) => void;
  onCopy: (outline: Array<Point>) => void;
  onMove: (index: number, point: Point) => void;
  onRemove: (index: number) => void;
};

const lineOf = (outline: Array<Point>) =>
  outline.map(([x, y]) => toLngLat(x, y));

const ringOf = (outline: Array<Point>) => [
  ...lineOf(outline),
  toLngLat(...outline[0]),
];

const MakerMap = ({
  region,
  points,
  shape,
  references,
  showReference,
  selecting,
  onAdd,
  onCopy,
  onMove,
  onRemove,
}: MakerMapProps) => {
  const container = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<MapLibreMap>();
  const latest = useRef({
    selecting,
    references,
    onAdd,
    onCopy,
    onMove,
    onRemove,
  });

  latest.current = { selecting, references, onAdd, onCopy, onMove, onRemove };

  useEffect(() => {
    const element = container.current;

    if (!element) return undefined;

    const instance = new MapLibreMap({
      container: element,
      style: { version: 8, sources: {}, layers: [] },
      center: toLngLat(...START_CENTER),
      zoom: toGlZoom(START_ZOOM),
      minZoom: toGlZoom(MIN_ZOOM),
      maxZoom: toGlZoom(MAX_ZOOM),
      maxBounds: rectBounds(0, 0, region.width, region.height),
      pitch: 0,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      doubleClickZoom: false,
      renderWorldCopies: false,
      attributionControl: false,
      fadeDuration: 0,
    });

    instance.touchZoomRotate.disableRotation();
    instance.getCanvas().style.cursor = 'crosshair';
    instance.on('load', () => {
      addAnchors(instance);
      instance.addSource('references', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      instance.addSource('shape', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      instance.addLayer(
        {
          id: 'references-fill',
          type: 'fill',
          source: 'references',
          paint: { 'fill-color': '#e11d48', 'fill-opacity': 0 },
        },
        'z-shapes',
      );
      instance.addLayer(
        {
          id: 'references-line',
          type: 'line',
          source: 'references',
          paint: {
            'line-color': '#e11d48',
            'line-width': 2,
            'line-dasharray': [3, 3],
          },
        },
        'z-shapes',
      );
      instance.addLayer(
        {
          id: 'shape-fill',
          type: 'fill',
          source: 'shape',
          filter: ['==', ['geometry-type'], 'Polygon'],
          paint: { 'fill-color': SHAPE_COLOR, 'fill-opacity': 0.3 },
        },
        'z-shapes',
      );
      instance.addLayer(
        {
          id: 'shape-line',
          type: 'line',
          source: 'shape',
          paint: { 'line-color': SHAPE_COLOR, 'line-width': 2 },
        },
        'z-shapes',
      );
      instance.on('click', (event: MapMouseEvent) => {
        if (
          (event.originalEvent.target as HTMLElement | null)?.closest(
            '.map-maker-point',
          )
        )
          return;

        const current = latest.current;

        if (current.selecting) {
          const feature = instance.queryRenderedFeatures(event.point, {
            layers: ['references-fill'],
          })[0];
          const outline =
            feature && current.references[Number(feature.properties?.index)];

          if (outline) current.onCopy(outline.outline);

          return;
        }

        const { x, y } = fromLngLat(event.lngLat);

        current.onAdd(
          [Math.round(x), Math.round(y)],
          1 / 2 ** (instance.getZoom() - BASE_ZOOM),
        );
      });
      setMap(instance);
    });

    return () => {
      setMap(undefined);
      instance.remove();
    };
  }, [region.id, region.width, region.height]);

  useEffect(() => {
    if (!map) return;

    (map.getSource('references') as GeoJSONSource).setData({
      type: 'FeatureCollection',
      features: references.map(({ outline }, index) => ({
        type: 'Feature',
        properties: { index },
        geometry: { type: 'Polygon', coordinates: [ringOf(outline)] },
      })),
    });
  }, [map, references]);

  useEffect(() => {
    if (!map) return;

    const visibility = showReference ? 'visible' : 'none';

    map.setLayoutProperty('references-line', 'visibility', visibility);
    map.setLayoutProperty('references-fill', 'visibility', visibility);
  }, [map, showReference]);

  useEffect(() => {
    if (!map) return;

    const lines =
      shape.length > 2
        ? [
            {
              type: 'Feature' as const,
              properties: {},
              geometry: {
                type: 'Polygon' as const,
                coordinates: [ringOf(shape)],
              },
            },
          ]
        : shape.length > 1
          ? [
              {
                type: 'Feature' as const,
                properties: {},
                geometry: {
                  type: 'LineString' as const,
                  coordinates: lineOf(shape),
                },
              },
            ]
          : [];

    (map.getSource('shape') as GeoJSONSource).setData({
      type: 'FeatureCollection',
      features: lines,
    });
  }, [map, shape]);

  useEffect(() => {
    if (!map) return undefined;

    const markers = points.map(([x, y], index) => {
      const element = pointElement();
      const marker = new Marker({ element, draggable: true })
        .setLngLat(toLngLat(x, y))
        .addTo(map);

      marker.on('dragend', () => {
        const { x: dx, y: dy } = fromLngLat(marker.getLngLat());

        latest.current.onMove(index, [Math.round(dx), Math.round(dy)]);
      });
      element.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        latest.current.onRemove(index);
      });

      return marker;
    });

    return () => markers.forEach((marker) => marker.remove());
  }, [map, points]);

  return (
    <>
      <div ref={container} style={{ position: 'absolute', inset: 0 }} />
      {map && (
        <>
          <GlFloorImages map={map} image={region} />
          <GlZoomControls
            map={map}
            width={region.width}
            height={region.height}
            position="bottomleft"
          />
        </>
      )}
    </>
  );
};

export const MapMakerPage = () => {
  const region = getRegion(REGION_ID);
  const [mode, setMode] = useState<Mode>('polygon');
  const [points, setPoints] = useState<Array<Point>>([]);
  const [pointStyle, setPointStyle] = useState<PointStyle>('snap');
  const [anchorMode, setAnchorMode] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [showReference, setShowReference] = useState(true);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const references = useMemo(
    () =>
      region?.hotspots.flatMap(({ target, shape: outline }) =>
        outline ? [{ target, outline }] : [],
      ) ?? [],
    [region],
  );
  const shape = useMemo(
    () =>
      mode === 'points'
        ? []
        : mode === 'circle' && points.length === 2
          ? circleOutline(points[0], radiusOf(points[0], points[1]))
          : points,
    [mode, points],
  );

  if (!region) return null;

  const circle =
    mode === 'circle' && points.length === 2
      ? { center: points[0], radius: radiusOf(points[0], points[1]) }
      : undefined;
  const anchoring = anchorMode && mode === 'polygon' && points.length >= 2;
  const complete = circle
    ? true
    : mode === 'points'
      ? points.length > 0
      : points.length >= 3;
  const data = circle
    ? `{\n  "center": [${circle.center.join(', ')}],\n  "radius": ${circle.radius},\n  "outline": ${formatPoints(shape).replaceAll('\n', '\n  ')}\n}`
    : formatPoints(points);

  const addPoint = (point: Point, unitsPerPixel: number) => {
    if (selecting) return;

    if (anchoring) {
      const edge = nearestEdge(points, point);

      if (edge && edge.distance <= ANCHOR_TOLERANCE_PX * unitsPerPixel) {
        setPoints((current) => [
          ...current.slice(0, edge.index),
          edge.point,
          ...current.slice(edge.index),
        ]);
      }

      return;
    }

    if (mode === 'points' && pointStyle === 'snap') {
      const edge = nearestBorder(
        references.map(({ outline }) => outline),
        point,
      );

      if (edge && edge.distance <= ANCHOR_TOLERANCE_PX * unitsPerPixel) {
        setPoints((current) => [...current, edge.point]);
      }

      return;
    }

    setPoints((current) =>
      mode === 'circle' && current.length >= 2 ? [point] : [...current, point],
    );
  };

  const copyShape = (outline: Array<Point>) => {
    setSelecting(false);
    setMode('polygon');
    setPoints(outline.map(([x, y]) => [x, y]));
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setAnchorMode(false);
    setSelecting(false);
    setPoints([]);
  };

  const movePoint = (index: number, point: Point) =>
    setPoints((current) =>
      current.map((existing, i) => (i === index ? point : existing)),
    );

  const copy = async () => {
    await navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-40 bg-background">
      <div className="absolute inset-0 isolate overflow-hidden bg-muted">
        <MakerMap
          region={region}
          points={points}
          shape={shape}
          references={references}
          showReference={showReference}
          selecting={selecting}
          onAdd={addPoint}
          onCopy={copyShape}
          onMove={movePoint}
          onRemove={(index) =>
            setPoints((current) => current.filter((_, i) => i !== index))
          }
        />
      </div>
      <MapMakerSwitcher className="absolute top-3 right-3 z-[1100]" />
      <div className="pointer-events-none absolute right-3 bottom-3 left-16 z-[1000] flex flex-wrap items-center justify-end gap-2">
        <p className="pointer-events-auto mr-auto rounded-sm bg-background/90 px-3 py-1.5 text-sm shadow ring-1 ring-foreground/10">
          {selecting
            ? 'Click an existing shape to copy it.'
            : mode === 'points'
              ? pointStyle === 'snap'
                ? 'Click near a shape border to drop a point on it. Drag a point to move it, right-click to remove it.'
                : 'Click anywhere to drop a point. Drag a point to move it, right-click to remove it.'
              : mode === 'circle'
                ? 'Click the center, then click the edge. Drag either point to adjust.'
                : anchoring
                  ? 'Click on the shape edge to insert a point there.'
                  : 'Click to add a point, drag a point to move it, right-click a point to remove it.'}{' '}
          <span className="font-semibold tabular-nums">{points.length}</span>{' '}
          points
        </p>
        {MODES.map(({ id, label, Icon }) => (
          <Button
            key={id}
            variant={mode === id ? 'default' : 'outline'}
            className={mode === id ? activeToolbarButton : toolbarButton}
            aria-pressed={mode === id}
            onClick={() => switchMode(id)}
          >
            <Icon /> {label}
          </Button>
        ))}
        {mode === 'points' &&
          POINT_STYLES.map(({ id, label, Icon }) => (
            <Button
              key={id}
              variant={pointStyle === id ? 'default' : 'outline'}
              className={
                pointStyle === id ? activeToolbarButton : toolbarButton
              }
              aria-pressed={pointStyle === id}
              onClick={() => setPointStyle(id)}
            >
              <Icon /> {label}
            </Button>
          ))}
        <Button
          variant={anchoring ? 'default' : 'outline'}
          className={anchoring ? activeToolbarButton : toolbarButton}
          disabled={mode !== 'polygon' || points.length < 2}
          aria-pressed={anchoring}
          onClick={() => {
            setSelecting(false);
            setAnchorMode((current) => !current);
          }}
        >
          <Plus /> Add anchor point
        </Button>
        <Button
          variant={selecting ? 'default' : 'outline'}
          className={selecting ? activeToolbarButton : toolbarButton}
          aria-pressed={selecting}
          disabled={mode === 'points'}
          onClick={() => {
            setAnchorMode(false);
            setShowReference(true);
            setSelecting((current) => !current);
          }}
        >
          <MousePointerClick /> Select existing shape
        </Button>
        <Button
          variant="outline"
          className={toolbarButton}
          onClick={() => setShowReference((current) => !current)}
        >
          {showReference ? 'Hide' : 'Show'} existing shapes
        </Button>
        <Button
          variant="outline"
          className={toolbarButton}
          disabled={points.length === 0}
          onClick={() => setPoints((current) => current.slice(0, -1))}
        >
          <Undo2 /> Undo
        </Button>
        <Button
          variant="outline"
          className={toolbarButton}
          disabled={points.length === 0}
          onClick={() => setPoints([])}
        >
          <Eraser /> Clear
        </Button>
        <Button
          className={activeToolbarButton}
          disabled={!complete}
          onClick={() => setOpen(true)}
        >
          <Flag /> Finish
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Shape data</DialogTitle>
            <DialogDescription>
              {circle
                ? `Circle with radius ${circle.radius}, plus its ${CIRCLE_STEPS}-point outline`
                : `${points.length} points`}{' '}
              in Lumiose Town Map pixels (x, y). Copy this and send it over.
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
