import { useId, useState } from 'react';

import { MapPinned } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Game } from '@/data/games';
import { getRegion, type Region } from '@/data/maps';

import { TownMapDialog } from './TownMapDialog';
import { TownMapView } from './TownMapView';

type TownMapCardProps = {
  game: Game;
  region: Region;
  path: string;
};

export const TownMapCard = ({ game, region, path }: TownMapCardProps) => {
  const headingId = useId();
  const [open, setOpen] = useState(false);
  const [viewed, setViewed] = useState(region.id);

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col rounded-sm border bg-card"
    >
      <h2
        id={headingId}
        className="p-5 text-xs font-medium tracking-wider text-muted-foreground uppercase"
      >
        Town Map
      </h2>
      <div className="flex flex-col gap-4 px-5 pb-5">
        <TownMapView
          game={game}
          region={region}
          path={path}
          miniMap
          onChange={setViewed}
          className="gap-1"
        />
        <Button
          variant="outline"
          className="h-10 w-full"
          onClick={() => setOpen(true)}
        >
          <MapPinned aria-hidden />
          Open {getRegion(viewed)?.name ?? region.name} Town Map
        </Button>
      </div>
      <TownMapDialog
        open={open}
        game={game}
        region={region}
        path={path}
        initial={viewed}
        onClose={() => setOpen(false)}
      />
    </section>
  );
};
