import type { CSSProperties, ReactNode } from 'react';

import { ArrowRight, Lock } from 'lucide-react';
import { Link } from 'react-router';

import {
  type CatalogEntry,
  type UpcomingGame,
  versionGroupNames,
} from '@/data/catalog';
import { getCover } from '@/data/covers';
import type { Game, Platform } from '@/data/games';
import { getRegion } from '@/data/maps';
import { cn, formatList } from '@/lib/utils';

type GameCardProps = {
  entry: CatalogEntry;
};

export const GameCard = ({ entry }: GameCardProps) => {
  return entry.status === 'available' ? (
    <AvailableCard game={entry.game} />
  ) : (
    <UpcomingCard game={entry.game} />
  );
};

const AvailableCard = ({ game }: { game: Game }) => {
  const region = getRegion(game.region);

  if (!region) return null;

  const accent = game.colors[0];

  return (
    <Link
      to={`/${game.id}`}
      aria-label={`Open ${game.name} map`}
      className="group/card block h-full rounded-2xl outline-none"
      style={{ '--card-accent': accent } as CSSProperties}
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-xs transition-[translate,box-shadow,border-color] duration-260 ease-[cubic-bezier(.2,.8,.2,1)] group-hover/card:-translate-y-1.5 group-hover/card:border-[color-mix(in_oklch,var(--card-accent)_45%,var(--border))] group-hover/card:game-card-glow group-focus-visible/card:border-ring group-focus-visible/card:ring-3 group-focus-visible/card:ring-ring/55">
        <ColorStripe colors={game.colors} />
        <Cover gameId={game.id} accent={accent} interactive>
          <MapTag versionGroup={region.versionGroup} />
        </Cover>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="font-semibold tracking-tight text-pretty">
              {game.name}
            </span>
            <Details regions={[region.name]} platform={game.platform} />
          </div>
          <span className="mt-auto inline-flex h-11 items-center justify-center gap-1.5 rounded-[10px] border border-input bg-background text-sm font-medium transition-colors duration-200 group-hover/card:border-primary group-hover/card:bg-primary group-hover/card:text-primary-foreground group-focus-visible/card:border-primary group-focus-visible/card:bg-primary group-focus-visible/card:text-primary-foreground sm:h-9 dark:bg-input/30 dark:group-hover/card:bg-primary dark:group-focus-visible/card:bg-primary">
            Open map
            <ArrowRight className="size-4 transition-transform duration-260 ease-[cubic-bezier(.2,.8,.2,1)] group-hover/card:translate-x-1 group-focus-visible/card:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
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
        <CoverTag className="right-2.5">
          <Lock className="size-3" />
          Coming soon
        </CoverTag>
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
    <span className="text-[13px] leading-5 text-muted-foreground">
      {formatList(regions)} · {platform}
    </span>
  );
};

const MapTag = ({ versionGroup }: { versionGroup: string }) => {
  return (
    <CoverTag
      className="left-2.5"
      title={`Same maps in ${formatList(versionGroupNames(versionGroup))}`}
    >
      {versionGroup} map
    </CoverTag>
  );
};

const CoverTag = ({
  children,
  className,
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) => {
  return (
    <span
      title={title}
      className={cn(
        'absolute bottom-2.5 inline-flex h-6 items-center gap-1.5 rounded-full bg-[oklch(0.145_0_0/0.72)] px-2 text-xs font-medium text-[oklch(0.985_0_0)] backdrop-blur-sm',
        className,
      )}
    >
      {children}
    </span>
  );
};

const ColorStripe = ({
  colors,
  className,
}: {
  colors: Array<string>;
  className?: string;
}) => {
  return (
    <div className={cn('flex h-1 flex-none', className)}>
      {colors.map((color) => (
        <span key={color} className="flex-1" style={{ background: color }} />
      ))}
    </div>
  );
};

const Cover = ({
  gameId,
  accent,
  interactive = false,
  muted = false,
  children,
}: {
  gameId: string;
  accent: string;
  interactive?: boolean;
  muted?: boolean;
  children?: ReactNode;
}) => {
  const cover = getCover(gameId);

  return (
    <div
      className={cn(
        'relative aspect-16/10 overflow-hidden border-b bg-muted',
        muted && 'border-dashed',
      )}
    >
      {cover ? (
        <div className={cn('absolute inset-0', muted && 'opacity-70')}>
          <img
            src={cover}
            alt=""
            aria-hidden
            className="absolute inset-0 size-full scale-125 object-cover opacity-60 blur-xl"
          />
          <img
            src={cover}
            alt=""
            loading="lazy"
            className={cn(
              'relative mx-auto h-full object-contain py-3 drop-shadow-[0_6px_14px_oklch(0_0_0/0.35)]',
              interactive &&
                'transition-transform duration-420 ease-[cubic-bezier(.2,.8,.2,1)] group-hover/card:scale-106 group-focus-visible/card:scale-106',
            )}
          />
        </div>
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center px-4 text-center text-xs text-muted-foreground"
          style={{
            background: `color-mix(in oklch, ${accent} 18%, var(--muted))`,
          }}
        >
          No cover yet
        </div>
      )}
      {children}
    </div>
  );
};
