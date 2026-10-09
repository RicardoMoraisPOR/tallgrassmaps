import { MapPinned } from 'lucide-react';
import { Link } from 'react-router';

import { RegionMap } from '@/components/map/RegionMap';
import { Button } from '@/components/ui/button';
import type { Region } from '@/data/maps';

import { ExpandableCard } from './ExpandableCard';

type TownMapCardProps = {
  region: Region;
  path: string;
  href: (path: string) => string;
  collapsible?: boolean;
};

export const TownMapCard = ({
  region,
  path,
  href,
  collapsible,
}: TownMapCardProps) => {
  return (
    <ExpandableCard title="Town Map" defaultExpanded collapsible={collapsible}>
      <RegionMap
        region={region}
        locationHref={href}
        focus={path}
        miniMap
        className="gap-1"
      />
      <Button variant="outline" className="h-10 w-full" asChild>
        <Link to={href('')}>
          <MapPinned aria-hidden />
          Show {region.name}
        </Link>
      </Button>
    </ExpandableCard>
  );
};
