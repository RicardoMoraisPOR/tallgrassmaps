import type { Hotspot, Region, RegionCursor } from '@/data/maps';
import { cn } from '@/lib/utils';

import { AnimatedSprite } from './AnimatedSprite';
import { percent } from './coordinates';

type LocationCursorProps = {
  region: Region;
  hotspot: Hotspot;
  cursor?: RegionCursor;
};

export const LocationCursor = ({
  region,
  hotspot,
  cursor = region.cursor,
}: LocationCursorProps) => {
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
      {cursor.sheetFrames ? (
        <span
          className={cn('block size-full', cursor.pixelated && 'pixelated')}
          style={{
            backgroundImage: `url(${cursor.image})`,
            backgroundSize: `100% ${cursor.sheetFrames * 100}%`,
            backgroundPosition: 'top',
            backgroundRepeat: 'no-repeat',
          }}
        />
      ) : (
        <AnimatedSprite
          animation={{ frames: [cursor.image] }}
          blink={cursor.blink}
          pixelated={cursor.pixelated}
        />
      )}
    </span>
  );
};
