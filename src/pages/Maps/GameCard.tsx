import type { CSSProperties } from 'react';

import { ArrowRight, Lock } from 'lucide-react';
import { Link } from 'react-router';

import { ColorStripe, Cover } from '@/components/GameCover';
import { OverlayPill } from '@/components/OverlayPill';
import { entryRegionLabels } from '@/data/catalog/entries';
import type { CatalogEntry, UpcomingGame } from '@/data/catalog/types';
import { versionGroupNames } from '@/data/catalog/versionGroups';
import type { Game, Platform } from '@/data/games';
import { getRegion } from '@/data/maps';
import { formatList } from '@/lib/utils';

type GameCardProps = {
  entry: CatalogEntry;
};

export const GameCard = ({ entry }: GameCardProps) => {
  return entry.status === 'coming-soon' ? (
    <UpcomingCard game={entry} />
  ) : (
    <CatalogGameCard game={entry} />
  );
};

const CatalogGameCard = ({ game }: { game: Game }) => {
  const region = getRegion(game.region);

  if (!region) return null;

  const accent = game.colors[0];

  return (
    <div
      className="group/card relative isolate block h-full rounded-2xl"
      style={{ '--card-accent': accent } as CSSProperties}
    >
      <Link
        to={`/${game.id}`}
        aria-label={`Open ${game.fullName} map`}
        className="absolute inset-0 z-0 rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/55"
      />
      <div className="pointer-events-none relative z-10 flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-xs transition-colors duration-260 ease-[cubic-bezier(.2,.8,.2,1)] group-hover/card:border-[var(--card-accent)] group-has-[:focus-visible]/card:border-ring">
        <ColorStripe colors={game.colors} />
        <Cover gameId={game.id} accent={accent} interactive>
          <MapTag versionGroup={region.versionGroup} />
        </Cover>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="font-semibold tracking-tight text-pretty">
              {game.fullName}
            </span>
            <Details
              regions={entryRegionLabels(game)}
              platform={game.platform}
            />
          </div>
          <span className="mt-auto inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-input bg-background text-sm font-medium transition-colors duration-200 group-hover/card:border-primary group-hover/card:bg-primary group-hover/card:text-primary-foreground group-focus-visible/card:border-primary group-focus-visible/card:bg-primary group-focus-visible/card:text-primary-foreground sm:h-9 dark:bg-input/30 dark:group-hover/card:bg-primary dark:group-focus-visible/card:bg-primary">
            Open map
            <ArrowRight className="size-4 transition-transform duration-260 ease-[cubic-bezier(.2,.8,.2,1)] group-hover/card:translate-x-1 group-focus-visible/card:translate-x-1" />
          </span>
        </div>
      </div>
    </div>
  );
};

const UpcomingCard = ({ game }: { game: UpcomingGame }) => {
  return (
    <div
      aria-disabled="true"
      className="flex h-full cursor-not-allowed flex-col overflow-hidden rounded-2xl border border-dashed bg-muted/45 text-muted-foreground"
    >
      <ColorStripe colors={game.colors} className="opacity-35" />
      <Cover gameId={game.id} accent={game.colors[0]} muted>
        <MapTag versionGroup={game.versionGroup} />
        <OverlayPill className="right-2.5">
          <Lock className="size-3" />
          Coming soon
        </OverlayPill>
      </Cover>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="font-medium tracking-tight text-pretty">
          {game.title}
        </span>
        <Details regions={game.regions} platform={game.platform} />
      </div>
    </div>
  );
};

const Details = ({
  regions,
  platform,
}: {
  regions: Array<string>;
  platform: Platform;
}) => {
  return (
    <span className="text-xs leading-5 text-muted-foreground">
      {formatList(regions)} · {platform}
    </span>
  );
};

const MapTag = ({ versionGroup }: { versionGroup: string }) => {
  return (
    <OverlayPill
      className="left-2.5"
      title={`Same maps in ${formatList(versionGroupNames(versionGroup))}`}
    >
      {versionGroup} map
    </OverlayPill>
  );
};
