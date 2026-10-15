import { useId } from 'react';

import { MapPinned } from 'lucide-react';
import { Link } from 'react-router';

import { RegionMap } from '@/components/map/RegionMap';
import { Button } from '@/components/ui/button';
import type { Region } from '@/data/maps';

type TownMapCardProps = {
  region: Region;
  path: string;
  href: (path: string) => string;
};

export const TownMapCard = ({ region, path, href }: TownMapCardProps) => {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col rounded-xl border bg-card"
    >
      <h2
        id={headingId}
        className="p-5 text-xs font-medium tracking-wider text-muted-foreground uppercase"
      >
        Town Map
      </h2>
      <div className="flex flex-col gap-4 px-5 pb-5">
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
      </div>
    </section>
  );
};
