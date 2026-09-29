import { type CSSProperties, type PointerEvent, useRef, useState } from 'react';

import { Link } from 'react-router';

import { useThemeStyle } from '@/components/settings/themes';
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
  const themeStyle = useThemeStyle('townMap');

  const mapStyle = region.tallGrassMap ? themeStyle : 'game';
  const tallGrass = mapStyle === 'tall-grass';
  const { cursor, label } = region;
  const pointer =
    gamePointer && mapStyle === 'game' ? region.pointer : undefined;
  const active = hovered ?? (miniMap ? undefined : focus);
  const activeName = active ? getLocation(region, active)?.name : undefined;
  const activeHotspot = hovered
    ? getHotspot(region, hovered)
    : !miniMap && focus
      ? getHotspot(region, focus)
      : undefined;
  const focusHotspot = focus
    ? (getHotspot(region, focus) ??
      getHotspot(region, pathSegments(focus)[0]))
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
          className={cn(
            'h-6 text-center font-medium',
            tallGrass
              ? 'order-last text-[13px] leading-6 font-semibold tracking-[0.28em] uppercase'
              : label && 'sr-only',
          )}
          aria-live="polite"
        >
          {activeName ??
            (!tallGrass && (
              <span className="font-normal text-muted-foreground">
                Pick a town or route
              </span>
            ))}
        </figcaption>
      )}
      <RegionImage
        region={region}
        alt={`${region.name} map`}
        locationName={tallGrass ? undefined : activeName}
        hotspot={activeHotspot}
        mapStyle={mapStyle}
        className={cn('group/map', pointer && 'cursor-none')}
        onPointerMove={pointer && moveFlyer}
      >
        {(miniMap || tagLabel) && tallGrass && activeName && (
          <span
            aria-live="polite"
            className={cn(
              'pointer-events-none absolute top-1.5 left-1.5 z-10 max-w-[55%] truncate rounded-sm border bg-background/90 px-1 py-0.5 leading-tight shadow-sm',
              miniMap
                ? 'text-[12px] font-medium'
                : 'text-[28px] font-semibold tracking-[0.28em] uppercase',
            )}
          >
            {activeName}
          </span>
        )}
        {miniMap && focusHotspot && (
          <span
            aria-hidden
            className={cn(
              'pointer-events-none absolute',
              tallGrass
                ? 'rounded-[22%] bg-(--tg-cursor)/35 ring-2 ring-(--tg-cursor)'
                : 'rounded-[2px] bg-[oklch(0.62_0.24_25/0.6)] ring-2 ring-[oklch(0.45_0.2_25)]',
            )}
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
