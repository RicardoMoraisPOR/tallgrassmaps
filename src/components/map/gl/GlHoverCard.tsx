import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { Map as MapLibreMap } from 'maplibre-gl';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';

import { MAP_ICON_SIZE } from '../viewer/constants';
import type { MapLink } from '../viewer/types';
import { toLngLat } from './glCoordinates';

const HOVER_CARD_GAP = 10;
const HOVER_CARD_EDGE = 8;
const SEQUENTIAL_WINDOW_MS = 150;

let lastClosedAt = 0;

type GlHoverCardProps = {
  map: MapLibreMap;
  link: MapLink;
  anchor?: { x: number; y: number };
  interactive: boolean;
};

export const GlHoverCard = ({
  map,
  link,
  anchor,
  interactive,
}: GlHoverCardProps) => {
  const card = useRef<HTMLDivElement>(null);
  const [, setViewChanges] = useState(0);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [sequential] = useState(
    () => performance.now() - lastClosedAt < SEQUENTIAL_WINDOW_MS,
  );

  useEffect(
    () => () => {
      lastClosedAt = performance.now();
    },
    [],
  );

  useEffect(() => {
    const refresh = () => setViewChanges((count) => count + 1);

    map.on('move', refresh);
    map.on('zoom', refresh);

    return () => {
      map.off('move', refresh);
      map.off('zoom', refresh);
    };
  }, [map]);

  useLayoutEffect(() => {
    const measure = () =>
      setSize({
        width: card.current?.offsetWidth ?? 0,
        height: card.current?.offsetHeight ?? 0,
      });
    const observer = new ResizeObserver(measure);

    measure();

    if (card.current) observer.observe(card.current);

    return () => observer.disconnect();
  }, []);

  const centerX = anchor?.x ?? link.x + link.width / 2;
  const top = map.project(toLngLat(centerX, anchor?.y ?? link.y));
  const bottom = map.project(
    toLngLat(centerX, anchor?.y ?? link.y + link.height),
  );
  const container = map.getContainer();
  const gap =
    link.icon && !anchor ? MAP_ICON_SIZE / 2 + HOVER_CARD_GAP : HOVER_CARD_GAP;
  const below = top.y - gap - size.height < HOVER_CARD_EDGE;
  const left = Math.min(
    Math.max(top.x - size.width / 2, HOVER_CARD_EDGE),
    container.clientWidth - size.width - HOVER_CARD_EDGE,
  );

  return createPortal(
    <div
      ref={card}
      data-pinned={interactive || undefined}
      className={cn(
        'map-card absolute z-1000 w-max',
        !sequential && 'animate-in duration-120 fade-in-0 zoom-in-95',
        !interactive && 'pointer-events-none',
      )}
      style={{
        left,
        top: below ? bottom.y + gap : top.y - gap - size.height,
        transformOrigin: `${top.x - left}px ${below ? '0' : '100%'}`,
        visibility: size.height === 0 ? 'hidden' : undefined,
      }}
    >
      {link.tooltip}
    </div>,
    container,
  );
};
