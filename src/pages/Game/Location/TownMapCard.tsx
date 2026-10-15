import { useId, useState } from 'react';

import { MapPinned } from 'lucide-react';

import { RegionMap } from '@/components/map/RegionMap';
import { Button } from '@/components/ui/button';
import type { Region } from '@/data/maps';

import { TownMapDialog } from './TownMapDialog';

type TownMapCardProps = {
  region: Region;
  path: string;
  href: (path: string) => string;
};

export const TownMapCard = ({ region, path, href }: TownMapCardProps) => {
  const headingId = useId();
  const [open, setOpen] = useState(false);

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col rounded-lg border bg-card"
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
        <Button
          variant="outline"
          className="h-10 w-full"
          onClick={() => setOpen(true)}
        >
          <MapPinned aria-hidden />
          Open {region.name} Town Map
        </Button>
      </div>
      <TownMapDialog
        open={open}
        region={region}
        path={path}
        href={href}
        onClose={() => setOpen(false)}
      />
    </section>
  );
};
