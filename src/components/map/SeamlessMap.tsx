import {
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react';

import { type GeoJSONSource, Map as MapLibreMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { useThemeStyle } from '@/components/settings/themes';
import { getLocation, type Hotspot, type Region } from '@/data/maps';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings';

import { hotspotBorder } from './coordinates';
import {
  fromGlZoom,
  fromLngLat,
  rectBounds,
  toGlZoom,
  toLngLat,
} from './gl/glCoordinates';
import { GlFloorImages } from './gl/GlFloorImages';
import { addAnchors } from './gl/glLayers';
import './gl/glWorker';
import { GlZoomControls } from './gl/GlZoomControls';
import type { ZoomPosition } from './MapZoomControls';
import { mapIconArt, zaDoorArt } from './viewer/iconArt';
import { zoneLayerOf, zoneLayersOf } from './zoneLayers';
import { ZoneLayerToggle } from './ZoneLayerToggle';

const DOOR_SIZE = 30;
const MAX_ZOOM = 3;
const EXTRA_ZOOM_OUT = 0.5;
const CLAMP_MS = 200;
const SURROUNDING_SHARE = 0.75;
const FLY_MS = 500;
const BORDER_WEIGHT = 2;
const SELECTED_WEIGHT = BORDER_WEIGHT * 1.5;
const DOT_GAP = 3;
const GLOW_BLUR = 6;
const GLOW_WIDTH = 10;
const GLOW_STRENGTH = 0.7;
const SELECTED_OPACITY = 0.2;
const IDLE_OPACITY = 0.5;
const HOVER_OPACITY = 0.85;
const DEFAULT_COLOR = '#49ea82';
const ZONES = 'zones';
const TOOLTIP_GAP = 14;

type Rect = { x: number; y: number; width: number; height: number };

type Zone = {
  index: number;
  target: string;
  layer?: string;
  name: string;
  hotspot: Hotspot & { shape: Array<[number, number]> };
  focus: Rect;
};

const focusRect = (
  { x, y, width, height }: Hotspot,
  { width: mapWidth, height: mapHeight }: Region,
): Rect => {
  const side = Math.max(width, height) * (1 + SURROUNDING_SHARE * 2);
  const w = Math.min(side, mapWidth);
  const h = Math.min(side, mapHeight);

  return {
    x: Math.min(Math.max(0, x + width / 2 - w / 2), mapWidth - w),
    y: Math.min(Math.max(0, y + height / 2 - h / 2), mapHeight - h),
    width: w,
    height: h,
  };
};

const boundsOf = ({ x, y, width, height }: Rect) =>
  rectBounds(x, y, width, height);

const fitZoom = (map: MapLibreMap, region: Region) =>
  map.cameraForBounds(boundsOf({ x: 0, y: 0, ...region }))?.zoom ?? 0;

const frameFor = (
  map: MapLibreMap,
  target: Rect,
  inset: number,
  zoomOut = 0,
) => {
  const usable = Math.min(inset, map.getContainer().clientWidth / 2);
  const camera = map.cameraForBounds(boundsOf(target), {
    padding: { top: 0, bottom: 0, left: 0, right: usable },
  });

  return {
    center: camera?.center ?? map.getCenter(),
    zoom: (camera?.zoom ?? map.getZoom()) - zoomOut,
  };
};

type ZoneCameraProps = {
  map: MapLibreMap;
  region: Region;
  zone: Zone | undefined;
  rightInset: number;
  onMinZoom: (zoom: number) => void;
};

const ZoneCamera = ({
  map,
  region,
  zone,
  rightInset,
  onMinZoom,
}: ZoneCameraProps) => {
  const animations = useSettingsStore((state) => state.animations);
  const arrived = useRef(false);
  const previous = useRef<Zone | null>(null);
  const flying = useRef(false);
  const silent = useRef(false);
  const moved = useRef(false);

  const silently = (action: () => void) => {
    silent.current = true;

    try {
      action();
    } finally {
      silent.current = false;
    }
  };

  const target = zone?.focus ?? { x: 0, y: 0, ...region };

  const constrain = () =>
    silently(() => {
      map.setMaxBounds(null);
      map.setMinZoom(0);
      const minZoom = fitZoom(map, region) - EXTRA_ZOOM_OUT;

      map.setMinZoom(minZoom);
      onMinZoom(fromGlZoom(minZoom));
    });

  const frameZone = useEffectEvent(() => {
    const animate =
      arrived.current && animations && previous.current !== (zone ?? null);

    arrived.current = true;
    previous.current = zone ?? null;
    constrain();

    const { center, zoom } = frameFor(
      map,
      target,
      rightInset,
      zone ? 0 : EXTRA_ZOOM_OUT,
    );

    const settle = () => {
      flying.current = false;
      moved.current = false;
    };

    flying.current = animate;
    map.once('moveend', settle);

    if (animate) map.flyTo({ center, zoom, duration: FLY_MS });
    else silently(() => map.jumpTo({ center, zoom }));

    return () => {
      map.off('moveend', settle);
    };
  });

  useEffect(() => frameZone(), [zone, region, map, animations, rightInset]);

  useEffect(() => {
    const onStart = (event: { originalEvent?: unknown }) => {
      if (event.originalEvent && !flying.current && !silent.current)
        moved.current = true;
    };
    const clamp = () => {
      if (flying.current || silent.current) return;

      const { x, y } = fromLngLat(map.getCenter());
      const inside = {
        x: Math.min(Math.max(x, 0), region.width),
        y: Math.min(Math.max(y, 0), region.height),
      };

      if (inside.x !== x || inside.y !== y)
        map.easeTo({
          center: toLngLat(inside.x, inside.y),
          duration: CLAMP_MS,
        });
    };

    map.on('movestart', onStart);
    map.on('moveend', clamp);

    return () => {
      map.off('movestart', onStart);
      map.off('moveend', clamp);
    };
  }, [map, region, rightInset]);

  const refit = useEffectEvent(() => {
    if (flying.current) return;

    silently(() => {
      constrain();

      if (!moved.current) {
        const frame = frameFor(
          map,
          target,
          rightInset,
          zone ? 0 : EXTRA_ZOOM_OUT,
        );

        map.jumpTo(frame);
      }
    });
  });

  useEffect(() => {
    const onResize = () => refit();

    map.on('resize', onResize);

    return () => {
      map.off('resize', onResize);
    };
  }, [zone, region, map, rightInset]);

  return null;
};

const DoorMarkers = ({
  map,
  doors,
}: {
  map: MapLibreMap;
  doors: Array<[number, number]>;
}) => {
  const style = useThemeStyle('mapIcons');
  const doorsKey = doors.map(([x, y]) => `${x},${y}`).join('|');

  const placeDoors = useEffectEvent(() => {
    const markers = doors.map(([x, y]) => {
      const element = document.createElement('div');

      element.className = 'map-icon-anchor';
      element.style.cssText = `display:grid;width:${DOOR_SIZE}px;height:${DOOR_SIZE}px;pointer-events:none`;
      element.innerHTML =
        style === 'game'
          ? `<span class="map-icon map-icon-za">${zaDoorArt}</span>`
          : `<span class="map-icon map-link-entrance">${mapIconArt.door['tall-grass']}</span>`;

      return new Marker({ element, anchor: 'center' })
        .setLngLat(toLngLat(x, y))
        .addTo(map);
    });

    return () => markers.forEach((marker) => marker.remove());
  });

  useEffect(() => placeDoors(), [map, style, doorsKey]);

  return null;
};

type ZoneShapesProps = {
  map: MapLibreMap;
  zones: Array<Zone>;
  selected?: string;
  onSelect: (target: string) => void;
  onHover: (hover?: { name: string; x: number; y: number }) => void;
};

const ZoneShapes = ({
  map,
  zones,
  selected,
  onSelect,
  onHover,
}: ZoneShapesProps) => {
  const select = useEffectEvent((target: string) => onSelect(target));
  const hover = useEffectEvent(
    (value?: { name: string; x: number; y: number }) => onHover(value),
  );

  useEffect(() => {
    map.addSource(ZONES, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });

    map.addLayer(
      {
        id: 'zones-glow',
        type: 'line',
        source: ZONES,
        filter: ['==', ['get', 'selected'], true],
        layout: { 'line-join': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': GLOW_WIDTH,
          'line-blur': GLOW_BLUR,
          'line-opacity': GLOW_STRENGTH,
        },
      },
      'z-shapes',
    );
    map.addLayer(
      {
        id: 'zones-fill',
        type: 'fill',
        source: ZONES,
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': [
            'case',
            ['get', 'selected'],
            SELECTED_OPACITY,
            ['boolean', ['feature-state', 'hover'], false],
            HOVER_OPACITY,
            ['get', 'dimmed'],
            0,
            IDLE_OPACITY,
          ],
        },
      },
      'z-shapes',
    );
    map.addLayer(
      {
        id: 'zones-line',
        type: 'line',
        source: ZONES,
        filter: ['!', ['get', 'dimmed']],
        layout: { 'line-join': 'round', 'line-cap': 'butt' },
        paint: {
          'line-color': ['get', 'border'],
          'line-width': [
            'case',
            ['get', 'selected'],
            SELECTED_WEIGHT,
            BORDER_WEIGHT,
          ],
        },
      },
      'z-shapes',
    );
    map.addLayer(
      {
        id: 'zones-line-dotted',
        type: 'line',
        source: ZONES,
        filter: ['get', 'dimmed'],
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': ['get', 'border'],
          'line-width': BORDER_WEIGHT,
          'line-dasharray': [0.05, DOT_GAP],
        },
      },
      'z-shapes',
    );

    let hovered: number | undefined;

    const clear = () => {
      if (hovered !== undefined)
        map.setFeatureState({ source: ZONES, id: hovered }, { hover: false });

      hovered = undefined;
      map.getCanvas().style.cursor = '';
      hover(undefined);
    };

    const onMove = (event: {
      point: { x: number; y: number };
      features?: Array<{
        id?: string | number;
        properties: Record<string, unknown>;
      }>;
    }) => {
      const feature = event.features?.[0];

      if (!feature || feature.properties.selected === true) {
        clear();

        return;
      }

      const id = Number(feature.id);

      if (hovered !== id) {
        if (hovered !== undefined)
          map.setFeatureState({ source: ZONES, id: hovered }, { hover: false });

        map.setFeatureState({ source: ZONES, id }, { hover: true });
        hovered = id;
      }

      map.getCanvas().style.cursor = 'pointer';
      hover({
        name: String(feature.properties.name),
        x: event.point.x,
        y: event.point.y,
      });
    };

    const onClick = (event: {
      features?: Array<{ properties: Record<string, unknown> }>;
    }) => {
      const feature = event.features?.[0];

      if (feature && feature.properties.selected !== true)
        select(String(feature.properties.target));
    };

    map.on('mousemove', 'zones-fill', onMove);
    map.on('mouseleave', 'zones-fill', clear);
    map.on('click', 'zones-fill', onClick);

    return () => {
      map.off('mousemove', 'zones-fill', onMove);
      map.off('mouseleave', 'zones-fill', clear);
      map.off('click', 'zones-fill', onClick);
      ['zones-line-dotted', 'zones-line', 'zones-fill', 'zones-glow'].forEach(
        (id) => {
          if (map.getLayer(id)) map.removeLayer(id);
        },
      );

      if (map.getSource(ZONES)) map.removeSource(ZONES);
    };
  }, [map]);

  useEffect(() => {
    (map.getSource(ZONES) as GeoJSONSource | undefined)?.setData({
      type: 'FeatureCollection',
      features: zones.map((zone) => {
        const color = zone.hotspot.color ?? DEFAULT_COLOR;
        const isSelected = zone.target === selected;

        return {
          type: 'Feature' as const,
          id: zone.index,
          properties: {
            target: zone.target,
            name: zone.name,
            color,
            border: hotspotBorder(color),
            selected: isSelected,
            dimmed: selected !== undefined && !isSelected,
          },
          geometry: {
            type: 'Polygon' as const,
            coordinates: [
              [...zone.hotspot.shape, zone.hotspot.shape[0]].map(([x, y]) =>
                toLngLat(x, y),
              ),
            ],
          },
        };
      }),
    });
  }, [map, zones, selected]);

  return null;
};

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
