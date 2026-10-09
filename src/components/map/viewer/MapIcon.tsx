import { useEffect, useMemo, useRef } from 'react';

import {
  divIcon,
  DomEvent,
  type Marker as LeafletMarker,
  type PointTuple,
} from 'leaflet';
import { Marker } from 'react-leaflet';
import { useNavigate } from 'react-router';

import { useThemeStyle } from '@/components/settings/themes';
import type { Direction } from '@/data/maps';
import { travelState } from '@/lib/motion';
import { cn } from '@/lib/utils';

import { toLatLng } from '../coordinates';
import { MAP_ICON_SIZE } from './constants';
import { mapIconArt, mapStepArt } from './iconArt';
import type { MapLink, MapIconKind } from './types';

const edgeAnchors: Record<Direction, PointTuple> = {
  north: [MAP_ICON_SIZE / 2, 0],
  south: [MAP_ICON_SIZE / 2, MAP_ICON_SIZE],
  west: [0, MAP_ICON_SIZE / 2],
  east: [MAP_ICON_SIZE, MAP_ICON_SIZE / 2],
};

export const MapIcon = ({
  link,
  icon,
  active,
  onSelect,
}: {
  link: MapLink;
  icon: MapIconKind;
  active: boolean;
  onSelect?: () => void;
}) => {
  const navigate = useNavigate();
  const style = useThemeStyle('mapIcons');
  const markerRef = useRef<LeafletMarker>(null);

  const direction = icon.kind === 'arrow' ? icon.direction : undefined;
  const step = 'step' in icon ? icon.step : undefined;
  const stepArrow = step
    ? `<span class="map-icon-step" data-step="${step}">${mapStepArt[style]}</span>`
    : '';
  const marker = useMemo(
    () =>
      divIcon({
        className: cn(
          'map-icon-anchor',
          direction && `map-icon-anchor-${direction}`,
        ),
        html: `<span class="${cn('map-icon', link.className, style === 'game' && 'map-icon-game')}"${direction ? ` data-direction="${direction}"` : ''}>${mapIconArt[icon.kind][style]}</span>${stepArrow}`,
        iconSize: [MAP_ICON_SIZE, MAP_ICON_SIZE],
        iconAnchor: direction
          ? edgeAnchors[direction]
          : [MAP_ICON_SIZE / 2, MAP_ICON_SIZE / 2],
      }),
    [style, icon.kind, direction, stepArrow, link.className],
  );

  useEffect(() => {
    markerRef.current
      ?.getElement()
      ?.querySelector('.map-icon')
      ?.classList.toggle('map-icon-active', active);
  }, [active, marker]);

  return (
    <Marker
      ref={markerRef}
      position={toLatLng(link.x, link.y)}
      icon={marker}
      title={link.label}
      eventHandlers={{
        click: (event) => {
          if (onSelect) {
            DomEvent.stopPropagation(event);
            onSelect();
          }

          if (link.href)
            navigate(link.href, { state: travelState(link.travel) });
        },
      }}
    />
  );
};
