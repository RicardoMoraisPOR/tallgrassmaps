import { type CSSProperties, type PointerEvent, useRef, useState } from 'react';

import { Link } from 'react-router';

import { getHotspot, getLocation, type Region } from '@/data/maps';
import { cn } from '@/lib/utils';

import AnimatedSprite from './AnimatedSprite';
import { percent } from './coordinates';
import RegionImage from './RegionImage';

type RegionMapProps = {
  region: Region;
  locationHref: (path: string) => string;
  className?: string;
  style?: CSSProperties;
};

export default function RegionMap({
  region,
  locationHref,
  className,
  style,
}: RegionMapProps) {
  const [active, setActive] = useState<string>();
  const flyerRef = useRef<HTMLDivElement>(null);
  const { cursor, pointer, label } = region;
  const activeName = active ? getLocation(region, active)?.name : undefined;
  const activeHotspot = active ? getHotspot(region, active) : undefined;

  const moveFlyer = (event: PointerEvent<HTMLDivElement>) => {
    const flyer = flyerRef.current;
    if (!flyer || event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    flyer.style.left = `${event.clientX - bounds.left}px`;
    flyer.style.top = `${event.clientY - bounds.top}px`;
  };

  return (
    <figure className={cn('flex flex-col gap-2', className)} style={style}>
      <figcaption
        className={cn('h-6 text-center font-medium', label && 'sr-only')}
        aria-live="polite"
      >
        {activeName ?? (
          <span className="font-normal text-muted-foreground">
            Pick a town or route
          </span>
        )}
      </figcaption>
      <RegionImage
        region={region}
        alt={`${region.name} map`}
        locationName={activeName}
        hotspot={activeHotspot}
        className={cn('group/map', pointer && 'cursor-none')}
        onPointerMove={pointer && moveFlyer}
      >
        {region.hotspots.map((hotspot) => {
          const location = getLocation(region, hotspot.target);
          if (!location) return null;

          return (
            <Link
              key={hotspot.target}
              to={locationHref(hotspot.target)}
              aria-label={location.name}
              className={cn(
                'absolute',
                pointer && 'cursor-none',
                cursor
                  ? 'outline-none'
                  : 'outline-offset-2 hover:outline-2 hover:outline-foreground focus-visible:outline-2 focus-visible:outline-foreground',
              )}
              style={{
                left: percent(hotspot.x, region.width),
                top: percent(hotspot.y, region.height),
                width: percent(hotspot.width, region.width),
                height: percent(hotspot.height, region.height),
              }}
              onMouseEnter={() => setActive(hotspot.target)}
              onMouseLeave={() => setActive(undefined)}
              onFocus={() => setActive(hotspot.target)}
              onBlur={() => setActive(undefined)}
            />
          );
        })}
        {pointer && (
          <div
            ref={flyerRef}
            aria-hidden
            className="pointer-events-none absolute hidden group-hover/map:block"
            style={{
              width: percent(pointer.size, region.width),
              aspectRatio: '1',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <AnimatedSprite
              animation={pointer.fly}
              pixelated={pointer.pixelated}
              className="group-has-[a:hover]/map:hidden"
            />
            <AnimatedSprite
              animation={pointer.hover}
              pixelated={pointer.pixelated}
              className="hidden group-has-[a:hover]/map:block"
            />
          </div>
        )}
      </RegionImage>
    </figure>
  );
}
