import { useMemo, useState } from 'react';

import { CRS, divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Check,
  Circle,
  Copy,
  Eraser,
  Flag,
  Hexagon,
  Undo2,
} from 'lucide-react';
import {
  ImageOverlay,
  MapContainer,
  Marker,
  Polygon,
  Polyline,
  useMapEvents,
} from 'react-leaflet';

import { imageBounds, toLatLng } from '@/components/map/coordinates';
import { MapZoomControls } from '@/components/map/MapZoomControls';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getRegion } from '@/data/maps';

type Point = [number, number];
type Mode = 'polygon' | 'circle';

const REGION_ID = 'lumiose-za';
const START_CENTER: Point = [2450, 3820];
const START_ZOOM = 0;
const MAX_ZOOM = 4;
const SHAPE_COLOR = '#07b85e';
const CIRCLE_STEPS = 48;

const pointIcon = divIcon({
  className: '',
  html: '<span style="display:block;width:12px;height:12px;border-radius:9999px;background:#fff;border:2px solid #07b85e;box-shadow:0 0 0 1px #0004"></span>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

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

const ClickToAdd = ({ onAdd }: { onAdd: (point: Point) => void }) => {
  useMapEvents({
    click: ({ latlng }) =>
      onAdd([Math.round(latlng.lng), Math.round(-latlng.lat)]),
  });

  return null;
};

export const MapMakerPage = () => {
  const region = getRegion(REGION_ID);
  const [mode, setMode] = useState<Mode>('polygon');
  const [points, setPoints] = useState<Array<Point>>([]);
  const [showReference, setShowReference] = useState(true);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const bounds = useMemo(() => region && imageBounds(region), [region]);

  if (!region || !bounds) return null;

  const references = region.hotspots.flatMap(({ target, shape }) =>
    shape ? [{ target, outline: shape }] : [],
  );
  const circle =
    mode === 'circle' && points.length === 2
      ? { center: points[0], radius: radiusOf(points[0], points[1]) }
      : undefined;
  const shape = circle ? circleOutline(circle.center, circle.radius) : points;
  const positions = shape.map(([x, y]) => toLatLng(x, y));
  const complete = circle ? true : mode === 'polygon' && points.length >= 3;
  const data = circle
    ? `{\n  "center": [${circle.center.join(', ')}],\n  "radius": ${circle.radius},\n  "outline": ${formatPoints(shape).replaceAll('\n', '\n  ')}\n}`
    : formatPoints(points);

  const addPoint = (point: Point) =>
    setPoints((current) =>
      mode === 'circle' && current.length >= 2 ? [point] : [...current, point],
    );

  const switchMode = (next: Mode) => {
    setMode(next);
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
      <MapContainer
        crs={CRS.Simple}
        center={toLatLng(...START_CENTER)}
        zoom={START_ZOOM}
        maxBounds={bounds}
        maxBoundsViscosity={1}
        zoomSnap={0.5}
        minZoom={-3}
        maxZoom={MAX_ZOOM}
        attributionControl={false}
        zoomControl={false}
        className="size-full cursor-crosshair"
        style={{ background: 'var(--muted)' }}
      >
        <MapZoomControls position="topleft" />
        <ImageOverlay url={region.image} bounds={bounds} />
        <ClickToAdd onAdd={addPoint} />
        {showReference &&
          references.map(({ target, outline }) => (
            <Polygon
              key={target}
              positions={outline.map(([x, y]) => toLatLng(x, y))}
              interactive={false}
              pathOptions={{
                color: '#e11d48',
                weight: 2,
                dashArray: '6 6',
                fill: false,
              }}
            />
          ))}
        {shape.length > 2 ? (
          <Polygon
            positions={positions}
            interactive={false}
            pathOptions={{
              color: SHAPE_COLOR,
              weight: 2,
              fillColor: SHAPE_COLOR,
              fillOpacity: 0.3,
            }}
          />
        ) : (
          <Polyline
            positions={positions}
            interactive={false}
            pathOptions={{ color: SHAPE_COLOR, weight: 2 }}
          />
        )}
        {points.map(([x, y], index) => (
          <Marker
            key={index}
            position={toLatLng(x, y)}
            icon={pointIcon}
            draggable
            eventHandlers={{
              dragend: ({ target }) => {
                const { lat, lng } = target.getLatLng();

                movePoint(index, [Math.round(lng), Math.round(-lat)]);
              },
              contextmenu: () =>
                setPoints((current) => current.filter((_, i) => i !== index)),
            }}
          />
        ))}
      </MapContainer>
      <div className="pointer-events-none absolute top-3 right-3 left-16 z-[1000] flex flex-wrap items-center justify-end gap-2">
        <p className="pointer-events-auto mr-auto rounded-lg bg-background/90 px-3 py-1.5 text-sm shadow ring-1 ring-foreground/10">
          {mode === 'circle'
            ? 'Click the center, then click the edge. Drag either point to adjust.'
            : 'Click to add a point, drag a point to move it, right-click a point to remove it.'}{' '}
          <span className="font-semibold tabular-nums">{points.length}</span>{' '}
          points
        </p>
        <Button
          variant="outline"
          className="pointer-events-auto bg-background dark:bg-background"
          onClick={() => switchMode(mode === 'circle' ? 'polygon' : 'circle')}
        >
          {mode === 'circle' ? <Hexagon /> : <Circle />}
          {mode === 'circle' ? 'Polygon mode' : 'Circle mode'}
        </Button>
        <Button
          variant="outline"
          className="pointer-events-auto bg-background dark:bg-background"
          onClick={() => setShowReference((current) => !current)}
        >
          {showReference ? 'Hide' : 'Show'} existing shapes
        </Button>
        <Button
          variant="outline"
          className="pointer-events-auto bg-background dark:bg-background"
          disabled={points.length === 0}
          onClick={() => setPoints((current) => current.slice(0, -1))}
        >
          <Undo2 /> Undo
        </Button>
        <Button
          variant="outline"
          className="pointer-events-auto bg-background dark:bg-background"
          disabled={points.length === 0}
          onClick={() => setPoints([])}
        >
          <Eraser /> Clear
        </Button>
        <Button
          className="pointer-events-auto"
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
            className="h-64 w-full resize-none rounded-lg border bg-muted/40 p-2 font-mono text-xs"
          />
          <Button onClick={copy}>
            {copied ? <Check /> : <Copy />} {copied ? 'Copied' : 'Copy data'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
