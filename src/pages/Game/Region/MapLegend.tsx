import type { PlaceGroups } from '@/data/maps';

import { PlaceIcon } from './PlaceIcon';

export const MapLegend = ({ placeGroups }: { placeGroups: PlaceGroups }) => {
  const { groups, legend = groups.map(({ id }) => id) } = placeGroups;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
      {legend.flatMap((id) => {
        const group = groups.find((entry) => entry.id === id);

        return group
          ? [
              <span key={id} className="inline-flex items-center gap-1.5">
                <PlaceIcon shape={group.icon} />
                {group.singular}
              </span>,
            ]
          : [];
      })}
    </div>
  );
};
