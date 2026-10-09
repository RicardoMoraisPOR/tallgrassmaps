import { useEffect, useRef } from 'react';

import { type SVGOverlay as LeafletSVGOverlay } from 'leaflet';
import { SVGOverlay } from 'react-leaflet';

import type { SpriteFacing } from '@/data/trainers/types';
import { cn } from '@/lib/utils';

import { toLatLng } from '../coordinates';
import type { MapLink } from './types';

const SPRITE_SIZE = 16;
const SPRITE_FRAMES = 3;
const SPRITE_LAYER_Z = 200;

const facingFrames: Record<SpriteFacing, number> = {
  down: 0,
  up: 1,
  left: 2,
  right: 2,
};

export const MapSprite = ({
  link,
  sprite: { src, facing, faded, size = [SPRITE_SIZE, SPRITE_SIZE] },
  active,
  revealed,
}: {
  link: MapLink;
  sprite: NonNullable<MapLink['sprite']>;
  active: boolean;
  revealed: boolean;
}) => {
  const overlay = useRef<LeafletSVGOverlay>(null);
  const [width, height] = size;

  useEffect(() => {
    overlay.current
      ?.getElement()
      ?.classList.toggle('map-sprite-active', active);
  }, [active]);

  useEffect(() => {
    overlay.current
      ?.getElement()
      ?.classList.toggle('map-sprite-faded', Boolean(faded) && !revealed);
  }, [faded, revealed]);

  useEffect(() => {
    const element = overlay.current?.getElement();

    if (element)
      element.style.zIndex = String(
        SPRITE_LAYER_Z + Math.round(link.y + link.height),
      );
  }, [link.y, link.height]);

  return (
    <SVGOverlay
      ref={overlay}
      bounds={[
        toLatLng(link.x, link.y + link.height),
        toLatLng(link.x + link.width, link.y),
      ]}
      attributes={{
        viewBox: `0 ${facingFrames[facing] * height} ${width} ${height}`,
        class: cn('map-sprite', link.className),
      }}
      interactive={false}
    >
      <image
        href={src}
        width={width}
        height={height * SPRITE_FRAMES}
        transform={
          facing === 'right' ? `translate(${width} 0) scale(-1 1)` : undefined
        }
      />
    </SVGOverlay>
  );
};
