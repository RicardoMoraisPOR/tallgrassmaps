import type { Hotspot, Region } from '@/data/maps';
import { cn } from '@/lib/utils';

import { hotspotTints, percent } from './coordinates';

type HotspotOutlineProps = {
  hotspot: Hotspot & { shape: Array<[number, number]> };
  region: Region;
  shapeClassName: string;
  className?: string;
  inline?: boolean;
};

export const HotspotOutline = ({
  hotspot,
  region,
  shapeClassName,
  className,
  inline = false,
}: HotspotOutlineProps) => (
  <svg
    aria-hidden
    viewBox={`${hotspot.x} ${hotspot.y} ${hotspot.width} ${hotspot.height}`}
    preserveAspectRatio="none"
    className={cn('absolute overflow-visible', className)}
    style={{
      ...hotspotTints(hotspot),
      ...(inline
        ? { inset: 0, width: '100%', height: '100%' }
        : {
            left: percent(hotspot.x, region.width),
            top: percent(hotspot.y, region.height),
            width: percent(hotspot.width, region.width),
            height: percent(hotspot.height, region.height),
          }),
    }}
  >
    <polygon
      points={hotspot.shape.map((point) => point.join(',')).join(' ')}
      strokeWidth={2}
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      className={shapeClassName}
    />
  </svg>
);
