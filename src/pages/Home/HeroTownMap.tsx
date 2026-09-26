import { RegionImage } from '@/components/map/RegionImage';
import { getHotspot, getLocation, type Region } from '@/data/maps';

type HeroTownMapProps = {
  region: Region;
  focus: string;
};

export const HeroTownMap = ({ region, focus }: HeroTownMapProps) => {
  const hotspot = getHotspot(region, focus);
  const location = getLocation(region, focus);

  return (
    <figure className="relative m-0 flex flex-col items-center gap-3">
      <div
        aria-hidden
        className="absolute top-[46%] left-1/2 -z-10 aspect-square w-[78%] -translate-1/2 rounded-full blur-[40px]"
        style={{
          background:
            'radial-gradient(circle, oklch(0.74 0.15 145 / 0.55), oklch(0.74 0.15 145 / 0) 65%)',
        }}
      />
      <RegionImage
        region={region}
        alt={`${region.name} Town Map with the cursor on ${location?.name}`}
        locationName={location?.name}
        hotspot={hotspot}
        className="max-w-110 overflow-hidden border shadow-[0_30px_60px_-30px_oklch(0_0_0/0.45)]"
      />
      <figcaption className="text-xs text-muted-foreground">
        {region.name}&apos;s Town Map, from{' '}
        <a
          href={region.source.url}
          target="_blank"
          rel="noreferrer"
          className="text-foreground underline underline-offset-3"
        >
          {region.source.name}
        </a>{' '}
        ({region.source.credit})
      </figcaption>
    </figure>
  );
};
