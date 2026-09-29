import { BookOpen, Gamepad2 } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import type { Game } from '@/data/games';
import type { Region } from '@/data/maps';

import { hasPokedex } from '../Pokedex/pokedexViews';
import { usePokedexLink } from '../Pokedex/usePokedex';

type PokedexCardProps = {
  game: Game;
  region: Region;
};

export const PokedexCard = ({ game, region }: PokedexCardProps) => {
  const pokedexLink = usePokedexLink();

  return (
    <section
      aria-labelledby="pokedex-heading"
      className="flex flex-col gap-4 rounded-[14px] border bg-card p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="pokedex-heading"
          className="text-xs font-medium tracking-wider text-muted-foreground uppercase"
        >
          Pokédex
        </h2>
        <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <Gamepad2 aria-hidden className="size-4" />
          {game.platform}
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-2">
        <Stat label="In the Pokédex" value={region.pokedexSize} />
        {game.obtainableWithoutTrading !== undefined && (
          <Stat
            label={`In ${game.shortName} without trading`}
            value={game.obtainableWithoutTrading}
          />
        )}
      </dl>
      {hasPokedex(region) ? (
        <Button size="lg" className="w-full" asChild>
          <Link {...pokedexLink}>
            <BookOpen aria-hidden />
            Open Pokédex
          </Link>
        </Button>
      ) : (
        <div title="Coming soon">
          <Button size="lg" disabled className="w-full">
            <BookOpen aria-hidden />
            Open Pokédex
          </Button>
        </div>
      )}
    </section>
  );
};

const Stat = ({ label, value }: { label: string; value: number }) => {
  return (
    <div className="flex flex-col-reverse justify-end gap-0.5 rounded-[10px] bg-muted/60 px-3 py-2.5">
      <dt className="text-xs leading-4 text-muted-foreground">{label}</dt>
      <dd className="font-heading text-2xl font-bold tracking-tight tabular-nums">
        {value}
      </dd>
    </div>
  );
};
