import type { Region } from '@/data/maps';

import { PlacesMap } from '../Pokedex/PlacesMap';
import { ExpandableCard } from './ExpandableCard';

type TownMapCardProps = {
  region: Region;
  path: string;
  name: string;
};

export const TownMapCard = ({ region, path, name }: TownMapCardProps) => {
  return (
    <ExpandableCard title="Town Map" defaultExpanded>
      <PlacesMap
        region={region}
        paths={[path]}
        label={`${region.name} Town Map showing where ${name} is`}
      />
    </ExpandableCard>
  );
};
