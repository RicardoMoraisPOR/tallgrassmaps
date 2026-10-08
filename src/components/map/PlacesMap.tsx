import { type Hotspot, type Region } from '@/data/maps';
import { pathSegments } from '@/lib/paths';
import { cn } from '@/lib/utils';

import { hotspotHighlight, percent } from './coordinates';
import { HotspotOutline } from './HotspotOutline';
import { RegionImage } from './RegionImage';

const hotspotFor = (region: Region, path: string) =>
  region.hotspots.find((hotspot) => hotspot.target === path) ??
  region.hotspots.find((hotspot) => hotspot.target === pathSegments(path)[0]);

type PlacesMapProps = {
  region: Region;
  paths: Array<string>;
  label: string;
  className?: string;
};

export const PlacesMap = ({
  region,
  paths,
  label,
  className,
}: PlacesMapProps) => {
  const hotspots = [
    ...new Set(
      paths
        .map((path) => hotspotFor(region, path))
        .filter((hotspot): hotspot is Hotspot => hotspot !== undefined),
    ),
  ];

  return (
    <RegionImage
      region={region}
      alt={label}
      className={cn('overflow-hidden rounded-lg border', className)}
    >
      {hotspots.map((hotspot) =>
        hotspot.shape ? (
          <HotspotOutline
            key={hotspot.target}
            hotspot={{ ...hotspot, color: undefined, shape: hotspot.shape }}
            region={region}
            shapeClassName="fill-(--hotspot-highlight) stroke-(--hotspot-border)"
          />
        ) : (
          <span
            key={hotspot.target}
            aria-hidden
            className="absolute rounded-[2px] ring-2 ring-[oklch(0.45_0.2_25)]"
            style={{
              backgroundColor: hotspotHighlight({
                ...hotspot,
                color: undefined,
              }),
              left: percent(hotspot.x, region.width),
              top: percent(hotspot.y, region.height),
              width: percent(hotspot.width, region.width),
              height: percent(hotspot.height, region.height),
            }}
          />
        ),
      )}
    </RegionImage>
  );
};
