import { memo, useMemo } from 'react';

import { divIcon, type LeafletMouseEvent } from 'leaflet';
import { Marker } from 'react-leaflet';

import { useThemeStyle } from '@/components/settings/themes';

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

export const badgeCenter = ({ x, y, width, height, outline }: MapLink) => {
  const ring = outline?.[0];

  if (!ring || ring.length < 3) return { x: x + width / 2, y: y + height / 2 };

  let area = 0;
  let cx = 0;
  let cy = 0;

  ring.forEach(([x1, y1], index) => {
    const [x2, y2] = ring[(index + 1) % ring.length];
    const cross = x1 * y2 - x2 * y1;

    area += cross;
    cx += (x1 + x2) * cross;
    cy += (y1 + y2) * cross;
  });

  return area === 0
    ? { x: x + width / 2, y: y + height / 2 }
    : { x: cx / (3 * area), y: cy / (3 * area) };
};

const MONSTER_SPRITE = '/sprites/rby/overworld/monster.png';

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
          html: `<span class="map-wild-badge map-link-wild-badge ${style === 'game' ? 'map-wild-badge-game' : ''}"><span class="map-wild-badge-sprite" style="background-image:url(${MONSTER_SPRITE})"></span>${count}</span>`,
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
