import { percent } from '@/components/map/coordinates';
import { RegionImage } from '@/components/map/RegionImage';
import { type Hotspot, type Region } from '@/data/maps';
import { pathSegments } from '@/lib/paths';

const hotspotFor = (region: Region, path: string) =>
  region.hotspots.find((hotspot) => hotspot.target === path) ??
  region.hotspots.find((hotspot) => hotspot.target === pathSegments(path)[0]);

type PlacesMapProps = {
  region: Region;
  paths: Array<string>;
  label: string;
};

export const PlacesMap = ({ region, paths, label }: PlacesMapProps) => {
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
      className="overflow-hidden rounded-lg border"
    >
      {hotspots.map((hotspot) => (
        <span
          key={hotspot.target}
          aria-hidden
          className="absolute rounded-[2px] bg-[oklch(0.62_0.24_25/0.6)] ring-2 ring-[oklch(0.45_0.2_25)]"
          style={{
            left: percent(hotspot.x, region.width),
            top: percent(hotspot.y, region.height),
            width: percent(hotspot.width, region.width),
            height: percent(hotspot.height, region.height),
          }}
        />
      ))}
    </RegionImage>
  );
};
