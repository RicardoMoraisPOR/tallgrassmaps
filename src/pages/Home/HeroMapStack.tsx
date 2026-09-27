import type { ReactNode } from 'react';

import type { MotionValue } from 'motion/react';

import { percent } from '@/components/map/coordinates';
import { LocationCursor } from '@/components/map/LocationCursor';
import { LocationLabel } from '@/components/map/LocationLabel';
import { RegionImage } from '@/components/map/RegionImage';
import type { Hotspot, Region } from '@/data/maps';
import { cn } from '@/lib/utils';

import { HeroMapLayer } from './HeroMapLayer';
import { HeroMapSlab } from './HeroMapSlab';

type Point = [x: number, y: number];

const itemMarks: Array<Point> = [
  [38, 40],
  [70, 26],
  [112, 62],
  [52, 98],
  [128, 96],
  [92, 118],
];

const trainerMarks: Array<Point> = [
  [60, 56],
  [100, 40],
  [80, 84],
  [118, 78],
  [40, 74],
];

type HeroMapStackProps = {
  region: Region;
  alt: string;
  hotspot?: Hotspot;
  locationName?: string;
  explode: MotionValue<number>;
  children?: ReactNode;
};

export const HeroMapStack = ({
  region,
  alt,
  hotspot,
  locationName,
  explode,
  children,
}: HeroMapStackProps) => {
  const marks = (points: Array<Point>, color: string, className: string) =>
    points.map(([x, y]) => (
      <span
        key={`${x}-${y}`}
        className={cn('absolute size-[3.5cqw] -translate-1/2', className)}
        style={{
          left: percent(x, region.width),
          top: percent(y, region.height),
          background: color,
        }}
      />
    ));

  const guide = hotspot && {
    left: percent(hotspot.x + hotspot.width / 2, region.width),
    top: percent(hotspot.y + hotspot.height / 2, region.height),
  };

  return (
    <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
      <HeroMapSlab explode={explode}>
        <RegionImage
          region={region}
          alt={alt}
          className="overflow-hidden border shadow-[0_30px_60px_-30px_oklch(0_0_0/0.45)]"
        >
          {children}
        </RegionImage>
      </HeroMapSlab>
      <HeroMapLayer
        explode={explode}
        index={0}
        label="Items"
        plate
        marks={marks(itemMarks, 'var(--map-item)', 'rounded-full')}
      />
      <HeroMapLayer
        explode={explode}
        index={1}
        label="Trainers"
        plate
        marks={marks(trainerMarks, 'var(--map-trainer)', 'rounded-[1px]')}
      />
      <HeroMapLayer
        explode={explode}
        index={2}
        guide={guide}
        swap={
          hotspot
            ? {
                from: <LocationCursor region={region} hotspot={hotspot} />,
                to: (
                  <div className="absolute inset-0 [filter:brightness(0)_invert(1)_drop-shadow(0_0_2px_color-mix(in_oklab,var(--brand)_70%,transparent))]">
                    <LocationCursor region={region} hotspot={hotspot} />
                  </div>
                ),
              }
            : undefined
        }
      />
      <HeroMapLayer
        explode={explode}
        index={3}
        plate
        swap={
          locationName
            ? {
                from: <LocationLabel region={region} name={locationName} />,
                to: (
                  <span className="absolute top-[3cqw] left-[3.5cqw] text-[5.5cqw] leading-none font-semibold tracking-[0.28em] text-foreground uppercase [text-shadow:0_0_1.2cqw_color-mix(in_oklab,var(--brand)_55%,transparent)]">
                    {locationName}
                  </span>
                ),
              }
            : undefined
        }
      />
    </div>
  );
};
