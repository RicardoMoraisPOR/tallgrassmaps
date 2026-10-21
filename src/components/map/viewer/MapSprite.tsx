import { useEffect, useMemo, useRef } from 'react';

import { divIcon, type Marker as LeafletMarker } from 'leaflet';
import { Marker } from 'react-leaflet';

import type { SpriteFacing } from '@/data/trainers/types';
import { cn } from '@/lib/utils';

import { toLatLng } from '../coordinates';
import type { MapLink } from './types';

const SPRITE_FRAME_STOPS = 2;

const facingFrames: Record<SpriteFacing, number> = {
  down: 0,
  up: 1,
  left: 2,
  right: 2,
};

export const MapSprite = ({
  link,
  sprite: { src, facing, faded },
  active,
  revealed,
}: {
  link: MapLink;
  sprite: NonNullable<MapLink['sprite']>;
  active: boolean;
  revealed: boolean;
}) => {
  const markerRef = useRef<LeafletMarker>(null);
  const icon = useMemo(
    () =>
      divIcon({
        className: 'map-sprite-anchor',
        html: `<span class="map-sprite-shadow" style="--sprite-w:${link.width}"></span><span class="${cn('map-sprite', link.className)}" style="--sprite-w:${link.width};--sprite-h:${link.height};--sprite-frame:${(facingFrames[facing] / SPRITE_FRAME_STOPS) * 100}%;--sprite-flip:${facing === 'right' ? -1 : 1};background-image:url(${src})"></span>`,
        iconSize: [0, 0],
      }),
    [src, facing, link.className, link.width, link.height],
  );

  useEffect(() => {
    markerRef.current
      ?.getElement()
      ?.querySelector('.map-sprite')
      ?.classList.toggle('map-sprite-active', active);
  }, [active, icon]);

  useEffect(() => {
    markerRef.current
      ?.getElement()
      ?.querySelector('.map-sprite')
      ?.classList.toggle('map-sprite-faded', Boolean(faded) && !revealed);
  }, [faded, revealed, icon]);

  return (
    <Marker
      ref={markerRef}
      position={toLatLng(link.x + link.width / 2, link.y + link.height)}
      icon={icon}
      interactive={false}
      keyboard={false}
    />
  );
};
