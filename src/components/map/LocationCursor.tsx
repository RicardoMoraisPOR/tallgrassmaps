import type { Hotspot, Region } from '@/data/maps';

import { AnimatedSprite } from './AnimatedSprite';
import { percent } from './coordinates';

type LocationCursorProps = {
  region: Region;
  hotspot: Hotspot;
};

export const LocationCursor = ({ region, hotspot }: LocationCursorProps) => {
  const { cursor } = region;

  if (!cursor) return null;

  return (
    <span
      className="pointer-events-none absolute"
      style={{
        left: percent(hotspot.x + hotspot.width / 2, region.width),
        top: percent(hotspot.y + hotspot.height / 2, region.height),
        width: percent(cursor.size, region.width),
        aspectRatio: '1',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <AnimatedSprite
        animation={{ frames: [cursor.image] }}
        blink={cursor.blink}
        pixelated={cursor.pixelated}
      />
    </span>
  );
};
