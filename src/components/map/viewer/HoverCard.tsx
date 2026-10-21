import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { DomEvent } from 'leaflet';
import { createPortal } from 'react-dom';
import { useMap, useMapEvents } from 'react-leaflet';

import { cn } from '@/lib/utils';

import { toLatLng } from '../coordinates';
import { MAP_ICON_SIZE } from './constants';
import type { MapLink } from './types';

const HOVER_CARD_GAP = 10;
const HOVER_CARD_EDGE = 8;
const SEQUENTIAL_WINDOW_MS = 150;

let lastClosedAt = 0;

export const HoverCard = ({
  link,
  anchor,
  interactive,
}: {
  link: MapLink;
  anchor?: { x: number; y: number };
  interactive: boolean;
}) => {
  const leafletMap = useMap();
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

  useMapEvents({
    move: () => setViewChanges((count) => count + 1),
    zoom: () => setViewChanges((count) => count + 1),
  });

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

  useLayoutEffect(() => {
    if (interactive && card.current) {
      DomEvent.disableClickPropagation(card.current);
      DomEvent.disableScrollPropagation(card.current);
    }
  }, [interactive]);

  const centerX = anchor?.x ?? link.x + link.width / 2;
  const top = leafletMap.latLngToContainerPoint(
    toLatLng(centerX, anchor?.y ?? link.y),
  );
  const bottom = leafletMap.latLngToContainerPoint(
    toLatLng(centerX, anchor?.y ?? link.y + link.height),
  );
  const container = leafletMap.getSize();
  const gap =
    link.icon && !anchor ? MAP_ICON_SIZE / 2 + HOVER_CARD_GAP : HOVER_CARD_GAP;
  const below = top.y - gap - size.height < HOVER_CARD_EDGE;
  const left = Math.min(
    Math.max(top.x - size.width / 2, HOVER_CARD_EDGE),
    container.x - size.width - HOVER_CARD_EDGE,
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
    leafletMap.getContainer(),
  );
};
