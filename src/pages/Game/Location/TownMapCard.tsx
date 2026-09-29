import type { Region } from '@/data/maps';

import { RegionMap } from '@/components/map/RegionMap';

import { ExpandableCard } from './ExpandableCard';

type TownMapCardProps = {
  region: Region;
  path: string;
  href: (path: string) => string;
};

export const TownMapCard = ({ region, path, href }: TownMapCardProps) => {
  return (
    <ExpandableCard title="Town Map" defaultExpanded>
      <RegionMap
        region={region}
        locationHref={href}
        focus={path}
        miniMap
        className="gap-1"
      />
    </ExpandableCard>
  );
};
