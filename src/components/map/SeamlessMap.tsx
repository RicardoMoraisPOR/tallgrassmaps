import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { getLocation, type Region } from '@/data/maps';
import { cn } from '@/lib/utils';

import { toGlZoom, toLngLat } from './gl/glCoordinates';
import { GlFloorImages } from './gl/GlFloorImages';
import { addAnchors } from './gl/glLayers';
import './gl/glWorker';
import { GlZoomControls } from './gl/GlZoomControls';
import type { ZoomPosition } from './MapZoomControls';
import { DoorMarkers } from './seamless/DoorMarkers';
import { ZoneCamera } from './seamless/ZoneCamera';
import { focusRect, type Zone } from './seamless/zoneGeometry';
import { ZoneShapes } from './seamless/ZoneShapes';
import { zoneLayerOf, zoneLayersOf } from './zoneLayers';
import { ZoneLayerToggle } from './ZoneLayerToggle';

const MAX_ZOOM = 3;
const TOOLTIP_GAP = 14;

type SeamlessMapProps = {
  region: Region;
  selected?: string;
  onSelect: (target: string) => void;
  rightInset?: number;
  zoomPosition?: ZoomPosition;
  className?: string;
};

export const SeamlessMap = ({
  region,
  selected,
  onSelect,
  rightInset = 0,
  zoomPosition,
  className,
}: SeamlessMapProps) => {
  const container = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<MapLibreMap>();
  const [crispZoom, setCrispZoom] = useState<number>();
  const [hover, setHover] = useState<{ name: string; x: number; y: number }>();
  const [seen, setSeen] = useState(selected);
  const [chosenLayer, setChosenLayer] = useState<string>();

  useEffect(() => {
    const element = container.current;

    if (!element) return undefined;

    const instance = new MapLibreMap({
      container: element,
      style: { version: 8, sources: {}, layers: [] },
      center: toLngLat(region.width / 2, region.height / 2),
      zoom: toGlZoom(0),
      maxZoom: toGlZoom(MAX_ZOOM),
      pitch: 0,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      renderWorldCopies: false,
      attributionControl: false,
      fadeDuration: 0,
    });

    instance.touchZoomRotate.disableRotation();
    instance.on('load', () => {
      addAnchors(instance);
      setMap(instance);
    });

    return () => {
      setMap(undefined);
      instance.remove();
    };
  }, [region.id, region.width, region.height]);

  const onMinZoom = useCallback(
    (zoom: number) =>
      setCrispZoom((current) =>
        current !== undefined && Math.abs(current - zoom) < 0.01
          ? current
          : zoom,
      ),
    [],
  );

  const zones = useMemo(
    () =>
      region.hotspots.flatMap((hotspot, index): Array<Zone> =>
        hotspot.shape
          ? [
              {
                index,
                target: hotspot.target,
                layer: zoneLayerOf(region, hotspot.target),
                name:
                  getLocation(region, hotspot.target)?.name ?? hotspot.target,
                hotspot: { ...hotspot, shape: hotspot.shape },
                focus: focusRect(hotspot, region),
              },
            ]
          : [],
      ),
    [region],
  );
  const current = zones.find((zone) => zone.target === selected);
  const layers = useMemo(
    () =>
      zoneLayersOf(
        region,
        zones.map((zone) => zone.target),
      ),
    [region, zones],
  );

  if (seen !== selected) {
    setSeen(selected);
    setHover(undefined);

    if (current?.layer) setChosenLayer(current.layer);
  }

  const activeLayer =
    chosenLayer ?? (layers.find(({ count }) => count > 0) ?? layers[0])?.id;
  const visibleZones = useMemo(
    () =>
      zones.filter(
        (zone) =>
          !zone.layer || zone.layer === activeLayer || zone.target === selected,
      ),
    [zones, activeLayer, selected],
  );
  const doors = useMemo(
    () => getLocation(region, selected ?? '')?.doors ?? [],
    [region, selected],
  );

  return (
    <div
      className={cn('relative isolate overflow-hidden', className)}
      style={{ background: 'var(--muted)' }}
    >
      <div ref={container} style={{ position: 'absolute', inset: 0 }} />
      {map && (
        <>
          {crispZoom !== undefined && (
            <GlFloorImages map={map} image={region} crispZoom={crispZoom} />
          )}
          <ZoneCamera
            map={map}
            region={region}
            zone={current}
            rightInset={rightInset}
            onMinZoom={onMinZoom}
          />
          <ZoneShapes
            map={map}
            zones={visibleZones}
            selected={selected}
            onSelect={onSelect}
            onHover={setHover}
          />
          <DoorMarkers map={map} doors={doors} />
          <GlZoomControls
            map={map}
            width={region.width}
            height={region.height}
            position={zoomPosition ?? 'topleft'}
          />
        </>
      )}
      {hover && (
        <div
          className="zone-tooltip pointer-events-none absolute z-1000"
          style={{
            left: hover.x,
            top: hover.y - TOOLTIP_GAP,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <ZoneName name={hover.name} />
        </div>
      )}
      {layers.length > 1 && (
        <ZoneLayerToggle
          layers={layers}
          active={activeLayer}
          onChange={setChosenLayer}
        />
      )}
    </div>
  );
};

const ZoneName = ({ name }: { name: string }) => {
  const [, text, number] = name.match(/^(.*?)\s*(\d+)$/) ?? [];

  return number ? (
    <>
      {text}
      <span className="zone-tooltip-number">{number}</span>
    </>
  ) : (
    name
  );
};
