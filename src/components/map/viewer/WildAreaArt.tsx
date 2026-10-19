import { memo, useMemo } from 'react';

import { divIcon, type LeafletMouseEvent } from 'leaflet';
import { Marker } from 'react-leaflet';

import { useThemeStyle } from '@/components/settings/themes';
import type { ThemeStyle } from '@/stores/settings';

import { toLatLng } from '../coordinates';
import type { MapLink } from './types';

const patternStyle = (strokeOpacity: number) => ({
  stroke: {
    fill: 'none',
    stroke: 'var(--map-wild-pokemon)',
    strokeOpacity,
    strokeWidth: 1,
  },
});

const Pattern = ({
  id,
  size,
  path,
  strokeOpacity,
}: {
  id: string;
  size: [number, number];
  path: string;
  strokeOpacity: number;
}) => {
  const style = patternStyle(strokeOpacity);

  return (
    <pattern
      id={id}
      width={size[0]}
      height={size[1]}
      patternUnits="userSpaceOnUse"
    >
      <path d={path} style={style.stroke} />
    </pattern>
  );
};

const GRASS: [number, number] = [16, 16];
const GRASS_PATH = 'M-1 17 L17 -1 M15 17 L17 15 M-1 1 L1 -1';
const WATER: [number, number] = [20, 12];
const WATER_PATH = 'M0 6 Q5 1 10 6 T20 6';
const GRASS_SELECTED: [number, number] = [9, 9];
const GRASS_SELECTED_PATH = 'M-1 10 L10 -1 M8 10 L10 8 M-1 1 L1 -1';
const WATER_SELECTED: [number, number] = [12, 8];
const WATER_SELECTED_PATH = 'M0 4 Q3 0.5 6 4 T12 4';

export const WildAreaPatterns = () => (
  <svg
    aria-hidden
    width="0"
    height="0"
    className="pointer-events-none absolute"
  >
    <defs>
      <Pattern
        id="wild-grass"
        size={GRASS}
        path={GRASS_PATH}
        strokeOpacity={0.4}
      />
      <Pattern
        id="wild-grass-hover"
        size={GRASS_SELECTED}
        path={GRASS_SELECTED_PATH}
        strokeOpacity={0.7}
      />
      <Pattern
        id="wild-water"
        size={WATER}
        path={WATER_PATH}
        strokeOpacity={0.4}
      />
      <Pattern
        id="wild-water-hover"
        size={WATER_SELECTED}
        path={WATER_SELECTED_PATH}
        strokeOpacity={0.7}
      />
    </defs>
  </svg>
);

type Point = [number, number];
type Ring = Array<Point>;

const GAME_SQUARE = 16;
const SEARCH_STEP = 4;

const ringArea = (ring: Ring) =>
  ring.reduce((sum, [x1, y1], index) => {
    const [x2, y2] = ring[(index + 1) % ring.length];

    return sum + (x1 * y2 - x2 * y1) / 2;
  }, 0);

const ringCentroid = (ring: Ring): Point | undefined => {
  const area = ringArea(ring);

  if (area === 0) return undefined;

  let cx = 0;
  let cy = 0;

  ring.forEach(([x1, y1], index) => {
    const [x2, y2] = ring[(index + 1) % ring.length];
    const cross = x1 * y2 - x2 * y1;

    cx += (x1 + x2) * cross;
    cy += (y1 + y2) * cross;
  });

  return [cx / (6 * area), cy / (6 * area)];
};

const insideRings = (rings: Array<Ring>, x: number, y: number) => {
  let inside = false;

  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];

      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
        inside = !inside;
    }
  }

  return inside;
};

const edgeDistance = (rings: Array<Ring>, x: number, y: number) => {
  let best = Infinity;

  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [ax, ay] = ring[j];
      const [bx, by] = ring[i];
      const dx = bx - ax;
      const dy = by - ay;
      const lengthSquared = dx * dx + dy * dy;
      const t =
        lengthSquared === 0
          ? 0
          : Math.max(
              0,
              Math.min(1, ((x - ax) * dx + (y - ay) * dy) / lengthSquared),
            );

      best = Math.min(best, Math.hypot(x - (ax + t * dx), y - (ay + t * dy)));
    }
  }

  return best;
};

const centers = new WeakMap<MapLink, { x: number; y: number }>();

const computeCenter = ({ x, y, width, height, outline }: MapLink) => {
  const fallback = { x: x + width / 2, y: y + height / 2 };
  const rings = (outline ?? []).filter((ring) => ring.length >= 3);

  if (rings.length === 0) return fallback;

  const largest = rings.reduce((best, ring) =>
    Math.abs(ringArea(ring)) > Math.abs(ringArea(best)) ? ring : best,
  );
  const [cx, cy] = ringCentroid(largest) ?? [fallback.x, fallback.y];

  if (insideRings(rings, cx, cy) && edgeDistance(rings, cx, cy) >= GAME_SQUARE)
    return { x: cx, y: cy };

  const xs = rings.flat().map(([px]) => px);
  const ys = rings.flat().map(([, py]) => py);
  let nearest: { x: number; y: number; gap: number } | undefined;
  let roomiest: { x: number; y: number; room: number } | undefined;

  for (let px = Math.min(...xs); px <= Math.max(...xs); px += SEARCH_STEP) {
    for (let py = Math.min(...ys); py <= Math.max(...ys); py += SEARCH_STEP) {
      if (!insideRings(rings, px, py)) continue;

      const room = edgeDistance(rings, px, py);
      const gap = Math.hypot(px - cx, py - cy);

      if (!roomiest || room > roomiest.room) roomiest = { x: px, y: py, room };

      if (room >= GAME_SQUARE && (!nearest || gap < nearest.gap))
        nearest = { x: px, y: py, gap };
    }
  }

  return nearest ?? roomiest ?? { x: cx, y: cy };
};

export const badgeCenter = (link: MapLink) => {
  const known = centers.get(link);

  if (known) return known;

  const center = computeCenter(link);

  centers.set(link, center);

  return center;
};

const MONSTER_SPRITE = '/sprites/rby/overworld/monster.png';

const BALL_ICON =
  '<svg class="map-wild-badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 12a9 9 0 0 1 18 0z" fill="currentColor" fill-opacity="0.35" stroke="none"/><circle cx="12" cy="12" r="9"/><path d="M3 12h5.5M15.5 12H21"/><circle cx="12" cy="12" r="3.25" fill="var(--card)"/></svg>';

export const wildBadgeHtml = (style: ThemeStyle, count: number) =>
  style === 'game'
    ? `<span class="map-wild-badge map-link-wild-badge map-wild-badge-game"><span class="map-wild-badge-sprite" style="background-image:url(${MONSTER_SPRITE})"></span>${count}</span>`
    : `<span class="map-wild-badge map-link-wild-badge">${BALL_ICON}${count}</span>`;

export const WildBadge = memo(
  ({
    link,
    onClick,
  }: {
    link: MapLink;
    onClick: (event: LeafletMouseEvent) => void;
  }) => {
    const style = useThemeStyle('mapIcons');
    const { x, y } = badgeCenter(link);
    const count = link.badge ?? 0;
    const icon = useMemo(
      () =>
        divIcon({
          className: 'map-wild-badge-anchor',
          html: wildBadgeHtml(style, count),
          iconSize: [0, 0],
        }),
      [count, style],
    );
    const position = useMemo(() => toLatLng(x, y), [x, y]);

    return (
      <Marker
        position={position}
        icon={icon}
        keyboard={false}
        eventHandlers={{ click: onClick }}
      />
    );
  },
);
