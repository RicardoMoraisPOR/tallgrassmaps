import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import '@fontsource/barlow/700.css';
import {
  CRS,
  divIcon,
  latLngBounds,
  type LatLngBounds,
  type Map as LeafletMap,
  type Path,
  point,
} from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ImageOverlay,
  MapContainer,
  Marker,
  Polygon,
  Tooltip,
  useMap,
} from 'react-leaflet';

import { useThemeStyle } from '@/components/settings/themes';
import { getLocation, type Hotspot, type Region } from '@/data/maps';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings';

import { hotspotBorder, imageBounds, toLatLng } from './coordinates';
import { MapZoomControls, type ZoomPosition } from './MapZoomControls';
import { mapIconArt } from './viewer/iconArt';

const MIN_ZOOM = -8;
const DOOR_SIZE = 26;
const ZOOM_TOLERANCE = 0.05;
const INTERACTION_MS = 1500;
const NO_BOUNDS = latLngBounds([]);
const MAX_ZOOM = 3;
const SURROUNDING_SHARE = 0.75;
const FLY_SECONDS = 0.9;
const BORDER_WEIGHT = 2;
const SELECTED_WEIGHT = BORDER_WEIGHT * 1.5;
const DOTTED = '0.1 6';
const GLOW_BLUR = 6;
const GLOW_STRENGTH = 0.7;
const SELECTED_OPACITY = 0.2;
const IDLE_OPACITY = 0.5;
const HOVER_OPACITY = 0.85;
const DEFAULT_COLOR = '#49ea82';

type Zone = {
  target: string;
  name: string;
  hotspot: Hotspot & { shape: Array<[number, number]> };
  focus: LatLngBounds;
};

const focusBounds = (
  { x, y, width, height }: Hotspot,
  { width: mapWidth, height: mapHeight }: Region,
) => {
  const side = Math.max(width, height) * (1 + SURROUNDING_SHARE * 2);
  const w = Math.min(side, mapWidth);
  const h = Math.min(side, mapHeight);
  const left = Math.min(Math.max(0, x + width / 2 - w / 2), mapWidth - w);
  const top = Math.min(Math.max(0, y + height / 2 - h / 2), mapHeight - h);

  return latLngBounds(toLatLng(left, top + h), toLatLng(left + w, top));
};

const withInset = (
  map: LeafletMap,
  full: LatLngBounds,
  inset: number,
  zoom = map.getZoom(),
) =>
  latLngBounds(full.getSouthWest(), [
    full.getNorth(),
    full.getEast() + inset / map.getZoomScale(zoom, 0),
  ]);

const frameFor = (
  map: LeafletMap,
  bounds: LatLngBounds,
  full: LatLngBounds,
  inset: number,
) => {
  const size = map.getSize();
  const usable = Math.min(inset, size.x / 2);
  const zoom = map.getBoundsZoom(bounds, false, point(usable, 0));
  const scale = map.getZoomScale(zoom, 0);
  const center = map
    .project(bounds.getCenter(), zoom)
    .add(point(usable / 2, 0));
  const imageWidth = full.getEast() * scale + usable;
  const imageHeight = -full.getSouth() * scale;
  const keepInside = (value: number, half: number, total: number) =>
    total <= half * 2
      ? total / 2
      : Math.min(Math.max(value, half), total - half);

  return {
    zoom,
    center: map.unproject(
      point(
        keepInside(center.x, size.x / 2, imageWidth),
        keepInside(center.y, size.y / 2, imageHeight),
      ),
      zoom,
    ),
  };
};

type ZoneCameraProps = {
  zone: Zone | undefined;
  full: LatLngBounds;
  rightInset: number;
  onLeave: () => void;
};

const ZoneCamera = ({ zone, full, rightInset, onLeave }: ZoneCameraProps) => {
  const map = useMap();
  const animations = useSettingsStore((state) => state.animations);
  const arrived = useRef(false);
  const previous = useRef<Zone | null>(null);
  const flying = useRef(false);
  const silent = useRef(false);
  const quiet = useRef(false);
  const moved = useRef(false);
  const interacting = useRef(false);
  const landing = useRef({ center: map.getCenter(), zoom: map.getZoom() });
  const leave = useRef(onLeave);

  useEffect(() => {
    leave.current = onLeave;
  }, [onLeave]);

  const silently = useCallback((action: () => void) => {
    silent.current = true;

    try {
      action();
    } finally {
      silent.current = false;
    }
  }, []);

  useEffect(() => {
    if (quiet.current) {
      quiet.current = false;
      previous.current = zone ?? null;

      return;
    }

    const animate =
      arrived.current && animations && previous.current !== (zone ?? null);

    arrived.current = true;
    previous.current = zone ?? null;

    silently(() => {
      map.invalidateSize({ animate: false });
      map.setMinZoom(MIN_ZOOM);
      map.setMinZoom(map.getBoundsZoom(full));
      map.setMaxBounds(NO_BOUNDS);
    });

    const { zoom, center } = frameFor(
      map,
      zone?.focus ?? full,
      full,
      rightInset,
    );

    const settle = () => {
      flying.current = false;
      moved.current = false;
      landing.current = { center: map.getCenter(), zoom: map.getZoom() };
      silently(() => map.setMaxBounds(withInset(map, full, rightInset)));
    };

    flying.current = animate;
    map.once('moveend', settle);

    if (animate) {
      map.flyTo(center, zoom, { animate, duration: FLY_SECONDS });
    } else {
      silently(() => map.setView(center, zoom, { animate: false }));
    }

    return () => {
      map.off('moveend', settle);
    };
  }, [zone, full, map, animations, rightInset, silently]);

  useEffect(() => {
    const container = map.getContainer();
    let timer: ReturnType<typeof setTimeout> | undefined;

    const touch = () => {
      interacting.current = true;
      clearTimeout(timer);
      timer = setTimeout(() => {
        interacting.current = false;
      }, INTERACTION_MS);
    };
    const track = () => {
      if (interacting.current && !flying.current && !silent.current) {
        moved.current = true;
      }
    };
    const inputs = ['pointerdown', 'wheel', 'keydown', 'touchstart'] as const;

    inputs.forEach((input) =>
      container.addEventListener(input, touch, {
        capture: true,
        passive: true,
      }),
    );
    map.on('moveend', track);

    return () => {
      clearTimeout(timer);
      inputs.forEach((input) =>
        container.removeEventListener(input, touch, { capture: true }),
      );
      map.off('moveend', track);
    };
  }, [map]);

  useEffect(() => {
    const refresh = () => {
      if (!flying.current) {
        silently(() => map.setMaxBounds(withInset(map, full, rightInset)));
      }
    };

    map.on('zoomend', refresh);

    return () => {
      map.off('zoomend', refresh);
    };
  }, [full, map, rightInset, silently]);

  useEffect(() => {
    if (!zone) return;

    const { focus } = zone;
    const reach = (focus.getEast() - focus.getWest()) / 2;
    const watch = () => {
      if (flying.current || silent.current || !interacting.current) return;

      const { center, zoom } = landing.current;
      const here = map.getCenter();
      const away =
        Math.abs(here.lng - center.lng) > reach ||
        Math.abs(here.lat - center.lat) > reach;

      if (away && map.getZoom() >= zoom - ZOOM_TOLERANCE) {
        quiet.current = true;
        leave.current();
      }
    };

    map.on('moveend', watch);

    return () => {
      map.off('moveend', watch);
    };
  }, [zone, map]);

  useEffect(() => {
    let initial = true;
    const observer = new ResizeObserver(() => {
      if (initial) {
        initial = false;

        return;
      }

      if (flying.current) return;

      silently(() => {
        map.setMaxBounds(NO_BOUNDS);
        map.invalidateSize({ animate: false });
        map.setMinZoom(MIN_ZOOM);
        map.setMinZoom(map.getBoundsZoom(full));

        if (!moved.current) {
          const frame = frameFor(map, zone?.focus ?? full, full, rightInset);

          map.setView(frame.center, frame.zoom, { animate: false });
          landing.current = { center: map.getCenter(), zoom: map.getZoom() };
        }

        map.setMaxBounds(withInset(map, full, rightInset));
      });
    });

    observer.observe(map.getContainer());

    return () => observer.disconnect();
  }, [zone, full, map, rightInset, silently]);

  return null;
};

const zaDoorArt =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 21V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v16"/><path d="M3 21h18"/><circle cx="14.5" cy="12.5" r="0.9" fill="currentColor"/></svg>';

const DoorMarker = ({ x, y }: { x: number; y: number }) => {
  const style = useThemeStyle('mapIcons');
  const icon = useMemo(
    () =>
      divIcon({
        className: 'map-icon-anchor',
        html:
          style === 'game'
            ? `<span class="map-icon map-icon-za">${zaDoorArt}</span>`
            : `<span class="map-icon map-link-entrance">${mapIconArt.door['tall-grass']}</span>`,
        iconSize: [DOOR_SIZE, DOOR_SIZE],
        iconAnchor: [DOOR_SIZE / 2, DOOR_SIZE / 2],
      }),
    [style],
  );

  return (
    <Marker
      position={toLatLng(x, y)}
      icon={icon}
      interactive={false}
      keyboard={false}
    />
  );
};

type SeamlessMapProps = {
  region: Region;
  selected?: string;
  onSelect: (target: string) => void;
  onLeave: () => void;
  rightInset?: number;
  zoomPosition?: ZoomPosition;
  className?: string;
};

export const SeamlessMap = ({
  region,
  selected,
  onSelect,
  onLeave,
  rightInset = 0,
  zoomPosition,
  className,
}: SeamlessMapProps) => {
  const [hovered, setHovered] = useState<string>();
  const [seen, setSeen] = useState(selected);

  if (seen !== selected) {
    setSeen(selected);
    setHovered(undefined);
  }

  const full = useMemo(() => latLngBounds(imageBounds(region)), [region]);
  const zones = useMemo(
    () =>
      region.hotspots.flatMap((hotspot): Array<Zone> =>
        hotspot.shape
          ? [
              {
                target: hotspot.target,
                name:
                  getLocation(region, hotspot.target)?.name ?? hotspot.target,
                hotspot: { ...hotspot, shape: hotspot.shape },
                focus: focusBounds(hotspot, region),
              },
            ]
          : [],
      ),
    [region],
  );
  const current = zones.find((zone) => zone.target === selected);

  return (
    <MapContainer
      key={region.id}
      crs={CRS.Simple}
      bounds={current?.focus ?? full}
      maxBounds={full}
      maxBoundsViscosity={1}
      zoomSnap={0}
      zoomDelta={0.5}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      attributionControl={false}
      zoomControl={false}
      className={cn('isolate', className)}
      style={{ background: 'var(--muted)' }}
    >
      <MapZoomControls position={zoomPosition ?? 'topleft'} />
      <ImageOverlay url={region.image} bounds={full} />
      <ZoneCamera
        zone={current}
        full={full}
        rightInset={rightInset}
        onLeave={onLeave}
      />
      {(getLocation(region, selected ?? '')?.doors ?? []).map(([x, y]) => (
        <DoorMarker key={`${selected}-${x}-${y}`} x={x} y={y} />
      ))}
      {zones.map((zone) => {
        const color = zone.hotspot.color ?? DEFAULT_COLOR;
        const isSelected = zone.target === selected;
        const dimmed = selected !== undefined && !isSelected;
        const isHovered = hovered === zone.target;

        return (
          <Polygon
            key={`${zone.target}-${isSelected}`}
            positions={zone.hotspot.shape.map(([x, y]) => toLatLng(x, y))}
            interactive={!isSelected}
            pathOptions={{
              color: hotspotBorder(color),
              weight: isSelected ? SELECTED_WEIGHT : BORDER_WEIGHT,
              lineJoin: 'round',
              lineCap: dimmed ? 'round' : 'butt',
              dashArray: dimmed ? DOTTED : undefined,
              fill: true,
              fillColor: color,
              fillOpacity: isSelected
                ? SELECTED_OPACITY
                : isHovered
                  ? HOVER_OPACITY
                  : dimmed
                    ? 0
                    : IDLE_OPACITY,
            }}
            eventHandlers={{
              click: () => onSelect(zone.target),
              add: ({ target }) => {
                if (!isSelected) return;

                const glow = `color-mix(in srgb, ${color} ${GLOW_STRENGTH * 100}%, transparent)`;

                const element = (target as Path).getElement() as
                  | SVGElement
                  | undefined;

                element?.style.setProperty(
                  'filter',
                  `drop-shadow(0 0 ${GLOW_BLUR}px ${glow})`,
                );
              },
              mouseover: () => setHovered(zone.target),
              mouseout: () => setHovered(undefined),
            }}
          >
            {!isSelected && (
              <Tooltip sticky direction="top" className="zone-tooltip">
                <ZoneName name={zone.name} />
              </Tooltip>
            )}
          </Polygon>
        );
      })}
    </MapContainer>
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
