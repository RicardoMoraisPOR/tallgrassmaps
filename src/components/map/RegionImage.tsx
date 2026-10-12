import type { HTMLAttributes } from 'react';

import type { Hotspot, Region } from '@/data/maps';
import { cn } from '@/lib/utils';

import { LocationCursor } from './LocationCursor';
import { LocationLabel } from './LocationLabel';

type RegionImageProps = HTMLAttributes<HTMLDivElement> & {
  region: Region;
  alt: string;
  locationName?: string;
  hotspot?: Hotspot;
};

export const RegionImage = ({
  region,
  alt,
  locationName,
  hotspot,
  className,
  style,
  children,
  ...props
}: RegionImageProps) => {
  return (
    <div
      className={cn('@container relative w-full', className)}
      style={{ aspectRatio: `${region.width} / ${region.height}`, ...style }}
      {...props}
    >
      <img
        src={region.image}
        alt={alt}
        className={cn('size-full select-none', region.pixelated && 'pixelated')}
        draggable={false}
      />
      {hotspot && (
        <LocationCursor
          key={hotspot.target}
          region={region}
          hotspot={hotspot}
        />
      )}
      {locationName && <LocationLabel region={region} name={locationName} />}
      {children}
    </div>
  );
};
