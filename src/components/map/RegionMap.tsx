import { type CSSProperties, type PointerEvent, useRef, useState } from 'react';

import { Link } from 'react-router';

import { getHotspot, getLocation, type Region } from '@/data/maps';
import { pathSegments } from '@/lib/paths';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings';

import { AnimatedSprite } from './AnimatedSprite';
import { percent } from './coordinates';
import { RegionImage } from './RegionImage';

type RegionMapProps = {
  region: Region;
  locationHref: (path: string) => string;
  focus?: string;
  miniMap?: boolean;
  tagLabel?: boolean;
  className?: string;
  style?: CSSProperties;
};

export const RegionMap = ({
  region,
  locationHref,
  focus,
  miniMap = false,
  tagLabel = false,
  className,
  style,
}: RegionMapProps) => {
  const [hovered, setHovered] = useState<string>();
  const flyerRef = useRef<HTMLDivElement>(null);

  const gamePointer = useSettingsStore((state) => state.gamePointer);
  const { cursor, label } = region;
  const pointer = gamePointer ? region.pointer : undefined;
  const active = hovered ?? (miniMap ? undefined : focus);
  const activeName = active ? getLocation(region, active)?.name : undefined;
  const activeHotspot = hovered
    ? getHotspot(region, hovered)
    : !miniMap && focus
      ? getHotspot(region, focus)
      : undefined;
  const focusHotspot = focus
    ? (getHotspot(region, focus) ?? getHotspot(region, pathSegments(focus)[0]))
    : undefined;

  const moveFlyer = (event: PointerEvent<HTMLDivElement>) => {
    const flyer = flyerRef.current;

    if (!flyer || event.pointerType !== 'mouse') return;

    const bounds = event.currentTarget.getBoundingClientRect();

    flyer.style.left = `${event.clientX - bounds.left}px`;
    flyer.style.top = `${event.clientY - bounds.top}px`;
  };

  return (
    <figure className={cn('flex flex-col gap-2', className)} style={style}>
      {!miniMap && !tagLabel && (
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
      )}
      <RegionImage
        region={region}
        alt={`${region.name} map`}
        locationName={activeName}
        hotspot={activeHotspot}
        className={cn('group/map', pointer && 'cursor-none')}
        onPointerMove={pointer && moveFlyer}
      >
        {miniMap && focusHotspot && (
          <span
            aria-hidden
            className="pointer-events-none absolute rounded-[2px] bg-[oklch(0.62_0.24_25/0.6)] ring-2 ring-[oklch(0.45_0.2_25)]"
            style={{
              left: percent(focusHotspot.x, region.width),
              top: percent(focusHotspot.y, region.height),
              width: percent(focusHotspot.width, region.width),
              height: percent(focusHotspot.height, region.height),
            }}
          />
        )}
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
              onMouseEnter={() => setHovered(hotspot.target)}
              onMouseLeave={() => setHovered(undefined)}
              onFocus={() => setHovered(hotspot.target)}
              onBlur={() => setHovered(undefined)}
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
};
