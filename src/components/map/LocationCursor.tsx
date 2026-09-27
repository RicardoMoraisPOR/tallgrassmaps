import type { Hotspot, Region } from '@/data/maps';

import { AnimatedSprite } from './AnimatedSprite';
import { percent } from './coordinates';

const TALL_GRASS_PADDING = 1;
const TALL_GRASS_STROKE = 1.1;

type LocationCursorProps = {
  region: Region;
  hotspot: Hotspot;
  variant?: 'game' | 'tall-grass';
};

export const LocationCursor = ({
  region,
  hotspot,
  variant = 'game',
}: LocationCursorProps) => {
  const { cursor } = region;

  if (variant === 'tall-grass') {
    return (
      <span
        aria-hidden
        className="pointer-events-none absolute rounded-[22%] border-(--tg-cursor)"
        style={{
          left: percent(hotspot.x - TALL_GRASS_PADDING, region.width),
          top: percent(hotspot.y - TALL_GRASS_PADDING, region.height),
          width: percent(hotspot.width + TALL_GRASS_PADDING * 2, region.width),
          height: percent(
            hotspot.height + TALL_GRASS_PADDING * 2,
            region.height,
          ),
          borderWidth: `${(TALL_GRASS_STROKE / region.width) * 100}cqw`,
        }}
      />
    );
  }

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
