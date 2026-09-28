import type { CSSProperties, ReactNode } from 'react';

import { m, type MotionValue } from 'motion/react';

import { percent } from '@/components/map/coordinates';
import { LocationCursor } from '@/components/map/LocationCursor';
import { LocationLabel } from '@/components/map/LocationLabel';
import { RegionImage } from '@/components/map/RegionImage';
import { getHotspot, type Hotspot, type Region } from '@/data/maps';
import { cn } from '@/lib/utils';

import { HeroMapLayer } from './HeroMapLayer';
import { HeroMapSlab } from './HeroMapSlab';

const legendaryPlaces = [
  'route-20/seafoam-islands',
  'route-10',
  'route-23/victory-road',
  'cerulean-city',
];

const rivalPlaces = [
  'pallet-town',
  'route-22',
  'cerulean-city',
  'vermilion-city',
  'lavender-town',
  'saffron-city',
  'indigo-plateau',
];

type HeroMapStackProps = {
  region: Region;
  alt: string;
  hotspot?: Hotspot;
  locationName?: string;
  explode: MotionValue<number>;
  mapSwap: MotionValue<number>;
  children?: ReactNode;
};

export const HeroMapStack = ({
  region,
  alt,
  hotspot,
  locationName,
  explode,
  mapSwap,
  children,
}: HeroMapStackProps) => {
  const marks = (places: Array<string>, color: string, className: string) =>
    places.flatMap((place) => {
      const spot = getHotspot(region, place);

      return spot
        ? [
            <span
              key={place}
              className={cn(
                'absolute size-[3.5cqw] -translate-1/2 bg-(--glow) shadow-[0_0_1.2cqw_var(--glow)] transition-shadow duration-300 group-hover/hero:shadow-[0_0_3cqw_var(--glow)]',
                className,
              )}
              style={
                {
                  left: percent(spot.x + spot.width / 2, region.width),
                  top: percent(spot.y + spot.height / 2, region.height),
                  '--glow': color,
                } as CSSProperties
              }
            />,
          ]
        : [];
    });

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
          {region.tallGrassMap && (
            <m.div
              aria-hidden
              className="absolute inset-0 bg-background"
              style={{ opacity: mapSwap }}
            >
              <RegionImage region={region} alt="" mapStyle="tall-grass" />
            </m.div>
          )}
          {children}
        </RegionImage>
      </HeroMapSlab>
      <HeroMapLayer
        explode={explode}
        index={0}
        label="Legendary Pokémon"
        plate
        marks={marks(
          legendaryPlaces,
          'var(--map-static-pokemon)',
          'rounded-full',
        )}
      />
      <HeroMapLayer
        explode={explode}
        index={1}
        label="Rival battles"
        plate
        marks={marks(rivalPlaces, 'var(--map-trainer)', 'rounded-[1px]')}
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
                  <div className="absolute inset-0 brightness-0 drop-shadow-[0_0_2px_color-mix(in_oklab,var(--brand)_70%,transparent)] dark:invert">
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
