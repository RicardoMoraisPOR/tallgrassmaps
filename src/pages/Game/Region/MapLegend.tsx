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
