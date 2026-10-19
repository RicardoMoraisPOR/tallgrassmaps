import { type ReactNode, useMemo, useState } from 'react';

import { Link } from 'react-router';

import { Cover } from '@/components/GameCover';
import { Button } from '@/components/ui/button';
import { platformParts, type Game } from '@/data/games';
import type { Region } from '@/data/maps';
import { gameHref } from '@/lib/paths';

import { extrasFor } from '../Extras/extras';
import { ExtrasDialog } from '../Extras/ExtrasDialog';
import type { GameExtra } from '../Extras/types';
import { gameStats, pokemonStats, worldStats } from './gameStats';
import { DataLakeLink, RelatedGames, StatGrid } from './GameSummary';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];

const dateFormat = new Intl.DateTimeFormat('en', { dateStyle: 'long' });

type GameInfoCardProps = {
  game: Game;
  region: Region;
  pageButton?: boolean;
};

export const GameInfoCard = ({
  game,
  region,
  pageButton = false,
}: GameInfoCardProps) => {
  const stats = useMemo(() => gameStats(game, region), [game, region]);
  const [extra, setExtra] = useState<GameExtra>();

  const extras = extrasFor(region.versionGroup) ?? [];

  return (
    <section
      aria-labelledby="game-heading"
      className="flex min-h-0 flex-1 flex-col overflow-hidden overflow-y-auto rounded-sm border bg-card"
    >
      <Cover gameId={game.id} accent={game.colors[0]} aspect="aspect-16/7" />
      <div className="flex flex-none flex-col gap-6 p-5">
        <div className="flex flex-col gap-2">
          <h2
            id="game-heading"
            className="font-heading text-2xl leading-tight font-bold tracking-tight text-balance"
          >
            {game.fullName}
          </h2>
          <p className="flex flex-wrap gap-x-2 text-sm text-muted-foreground">
            <span className="font-semibold">
              {platformParts[game.platform].map(({ text, color }, index) => (
                <span key={index} style={color ? { color } : undefined}>
                  {text}
                </span>
              ))}
            </span>
            <span aria-hidden>·</span>
            <span>
              Generation {ROMAN[game.generation - 1] ?? game.generation}
            </span>
            <span aria-hidden>·</span>
            <time dateTime={game.releaseDate}>
              {dateFormat.format(new Date(`${game.releaseDate}T00:00:00`))}
            </time>
            <span aria-hidden>·</span>
            <span>{game.developer}</span>
          </p>
        </div>

        {pageButton && (
          <Button size="lg" className="w-full" asChild>
            <Link to={gameHref(game.id)}>Open {game.shortName} page</Link>
          </Button>
        )}

        {extras.length > 0 && (
          <section className="flex flex-col gap-3">
            <SectionTitle>Guides</SectionTitle>
            {extras.map((entry) => (
              <Button
                key={entry.id}
                variant="outline"
                size="lg"
                className="w-full justify-between"
                onClick={() => setExtra(entry)}
              >
                {entry.title}
                <span className="text-xs text-muted-foreground tabular-nums">
                  {entry.count}
                </span>
              </Button>
            ))}
          </section>
        )}

        <section className="flex flex-col gap-3">
          <SectionTitle>Pokémon in this game</SectionTitle>
          <StatGrid stats={pokemonStats(game, stats)} />
        </section>

        <section className="flex flex-col gap-3">
          <SectionTitle>About this game</SectionTitle>
          <StatGrid stats={worldStats(stats)} />
          <DataLakeLink region={region} />
        </section>

        <section className="flex flex-col gap-3">
          <SectionTitle>Related</SectionTitle>
          <RelatedGames game={game} />
        </section>
      </div>
      <ExtrasDialog
        game={game}
        region={region}
        extra={extra}
        onOpenChange={(open) => !open && setExtra(undefined)}
      />
    </section>
  );
};

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h3 className="font-heading text-xl font-bold tracking-tight">{children}</h3>
);
