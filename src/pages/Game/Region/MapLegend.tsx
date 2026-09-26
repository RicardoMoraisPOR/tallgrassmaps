import type { MapSource, Region } from '@/data/maps';

import { PlaceIcon } from './PlaceIcon';

export const MapLegend = () => {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
      <LegendItem group="town">Town</LegendItem>
      <LegendItem group="landmark">Landmark</LegendItem>
      <LegendItem group="route">Route</LegendItem>
    </div>
  );
};

export const MapCredits = ({ region }: { region: Region }) => {
  return (
    <p className="text-xs text-muted-foreground">
      Map: <SourceLink source={region.source} />
      {region.pointer && (
        <>
          {' · '}Sprites: <SourceLink source={region.pointer.source} />
        </>
      )}
    </p>
  );
};

const LegendItem = ({
  group,
  children,
}: {
  group: 'town' | 'landmark' | 'route';
  children: string;
}) => {
  return (
    <span className="inline-flex items-center gap-1.5">
      <PlaceIcon group={group} />
      {children}
    </span>
  );
};

const SourceLink = ({ source }: { source: MapSource }) => {
  return (
    <>
      <a
        href={source.url}
        target="_blank"
        rel="noreferrer"
        className="text-foreground underline underline-offset-3"
      >
        {source.name}
      </a>
      , by {source.credit}
    </>
  );
};
