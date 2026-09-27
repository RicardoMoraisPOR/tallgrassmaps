import type { HTMLAttributes } from 'react';

import type { Hotspot, Region } from '@/data/maps';
import { cn } from '@/lib/utils';
import type { ThemeStyle } from '@/stores/settings';

import { LocationCursor } from './LocationCursor';
import { LocationLabel } from './LocationLabel';

type RegionImageProps = HTMLAttributes<HTMLDivElement> & {
  region: Region;
  alt: string;
  locationName?: string;
  hotspot?: Hotspot;
  mapStyle?: ThemeStyle;
};

export const RegionImage = ({
  region,
  alt,
  locationName,
  hotspot,
  mapStyle = 'game',
  className,
  style,
  children,
  ...props
}: RegionImageProps) => {
  const tallGrass = mapStyle === 'tall-grass' && region.tallGrassMap;

  return (
    <div
      className={cn('@container relative w-full', className)}
      style={{ aspectRatio: `${region.width} / ${region.height}`, ...style }}
      {...props}
    >
      {tallGrass ? (
        <div
          role="img"
          aria-label={alt}
          className="size-full select-none"
          dangerouslySetInnerHTML={{ __html: tallGrass }}
        />
      ) : (
        <img
          src={region.image}
          alt={alt}
          className={cn(
            'size-full select-none',
            region.pixelated && 'pixelated',
          )}
          draggable={false}
        />
      )}
      {hotspot && (
        <LocationCursor
          key={hotspot.target}
          region={region}
          hotspot={hotspot}
          variant={tallGrass ? 'tall-grass' : 'game'}
        />
      )}
      {locationName && <LocationLabel region={region} name={locationName} />}
      {children}
    </div>
  );
};
