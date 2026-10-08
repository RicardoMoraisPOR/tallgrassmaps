import { type CSSProperties, type PointerEvent, useRef, useState } from 'react';

import { Link } from 'react-router';

import { getHotspot, getLocation, type Region } from '@/data/maps';
import { pathSegments } from '@/lib/paths';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings';

import { AnimatedSprite } from './AnimatedSprite';
import { hotspotHighlight, percent } from './coordinates';
import { HotspotOutline } from './HotspotOutline';
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
        {miniMap &&
          focusHotspot &&
          (focusHotspot.shape ? (
            <HotspotOutline
              hotspot={{
                ...focusHotspot,
                color: undefined,
                shape: focusHotspot.shape,
              }}
              region={region}
              className="pointer-events-none"
              shapeClassName="fill-(--hotspot-highlight) stroke-(--hotspot-border)"
            />
          ) : (
            <span
              aria-hidden
              className="pointer-events-none absolute rounded-[2px] ring-2 ring-[oklch(0.45_0.2_25)]"
              style={{
                backgroundColor: hotspotHighlight({
                  ...focusHotspot,
                  color: undefined,
                }),
                left: percent(focusHotspot.x, region.width),
                top: percent(focusHotspot.y, region.height),
                width: percent(focusHotspot.width, region.width),
                height: percent(focusHotspot.height, region.height),
              }}
            />
          ))}
        {region.hotspots.map((hotspot) => {
          const location = getLocation(region, hotspot.target);

          if (!location) return null;

          const { shape } = hotspot;
          const current = miniMap && hotspot === focusHotspot;

          return (
            <Link
              key={hotspot.target}
              to={locationHref(hotspot.target)}
              aria-label={location.name}
              aria-current={current ? 'page' : undefined}
              tabIndex={current ? -1 : undefined}
              className={cn(
                'absolute',
                current && 'pointer-events-none',
                pointer && 'cursor-none',
                shape && 'group/zone pointer-events-none outline-none',
                !shape &&
                  (cursor
                    ? 'outline-none'
                    : 'outline-offset-2 hover:outline-2 hover:outline-foreground focus-visible:outline-2 focus-visible:outline-foreground'),
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
            >
              {shape && (
                <HotspotOutline
                  inline
                  hotspot={{ ...hotspot, shape }}
                  region={region}
                  shapeClassName={cn(
                    !current && 'pointer-events-auto',
                    'transition-colors group-hover/zone:fill-(--hotspot-active) group-hover/zone:stroke-(--hotspot-border) group-focus-visible/zone:fill-(--hotspot-active) group-focus-visible/zone:stroke-(--hotspot-border)',
                    hotspot.display === 'always' && !miniMap
                      ? 'fill-(--hotspot-idle) stroke-(--hotspot-border)'
                      : 'fill-transparent stroke-transparent',
                  )}
                />
              )}
            </Link>
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
