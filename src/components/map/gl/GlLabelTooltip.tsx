import { useEffect, useRef } from 'react';

import type { Map as MapLibreMap } from 'maplibre-gl';
import { createPortal } from 'react-dom';

import { MapTextTooltip } from '@/pages/Game/Location/MapTextTooltip';

import type { MapLink } from '../viewer/types';

const OFFSET_X = 12;
const OFFSET_Y = 12;

export const GlLabelTooltip = ({
  map,
  link,
}: {
  map: MapLibreMap;
  link: MapLink;
}) => {
  const element = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const place = (event: { point: { x: number; y: number } }) => {
      if (!element.current) return;

      element.current.style.transform = `translate(${event.point.x + OFFSET_X}px, ${event.point.y + OFFSET_Y}px)`;
      element.current.style.visibility = 'visible';
    };

    map.on('mousemove', place);

    return () => {
      map.off('mousemove', place);
    };
  }, [map]);

  return createPortal(
    <div
      ref={element}
      className="pointer-events-none absolute top-0 left-0 z-1000"
      style={{ visibility: 'hidden' }}
    >
      <MapTextTooltip text={link.label} />
    </div>,
    map.getContainer(),
  );
};
