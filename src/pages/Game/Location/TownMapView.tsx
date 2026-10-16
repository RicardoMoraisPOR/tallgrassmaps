import { useState } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { RegionMap } from '@/components/map/RegionMap';
import { Button } from '@/components/ui/button';
import { type Game, regionIdsOf } from '@/data/games';
import { getRegion, type Region, regionHref } from '@/data/maps';

type TownMapViewProps = {
  game: Game;
  region: Region;
  path: string;
  miniMap?: boolean;
  initial?: string;
  onChange?: (regionId: string) => void;
  className?: string;
};

export const TownMapView = ({
  game,
  region,
  path,
  miniMap,
  initial,
  onChange,
  className,
}: TownMapViewProps) => {
  const regions = regionIdsOf(game).flatMap((id) => getRegion(id) ?? []);
  const [own, setOwn] = useState(initial ?? region.id);
  const index = Math.max(
    0,
    regions.findIndex(({ id }) => id === own),
  );
  const shown = regions[index] ?? region;

  const step = (direction: number) => {
    const next = regions[index + direction];

    if (!next) return;

    setOwn(next.id);
    onChange?.(next.id);
  };

  return (
    <div className="flex flex-col gap-2">
      {regions.length > 1 && (
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Previous region map"
            disabled={index === 0}
            onClick={() => step(-1)}
          >
            <ChevronLeft aria-hidden />
          </Button>
          <span className="text-sm font-medium" aria-live="polite">
            {shown.name}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Next region map"
            disabled={index === regions.length - 1}
            onClick={() => step(1)}
          >
            <ChevronRight aria-hidden />
          </Button>
        </div>
      )}
      <RegionMap
        region={shown}
        locationHref={(target) => regionHref(game.id, shown, target)}
        focus={shown.id === region.id ? path : undefined}
        miniMap={miniMap}
        className={className}
      />
    </div>
  );
};
