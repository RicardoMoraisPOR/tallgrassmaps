import type { CSSProperties, ReactNode } from 'react';

import { ArrowRight, Link2, Lock } from 'lucide-react';
import { Link } from 'react-router';

import type { CatalogEntry, UpcomingGame } from '@/data/catalog';
import { getCover } from '@/data/covers';
import { type Game, games } from '@/data/games';
import { getRegion } from '@/data/maps';
import { cn } from '@/lib/utils';

type GameCardProps = {
  entry: CatalogEntry;
  generation: string;
};

export default function GameCard({ entry, generation }: GameCardProps) {
  return entry.status === 'available' ? (
    <AvailableCard game={entry.game} generation={generation} />
  ) : (
    <UpcomingCard game={entry.game} generation={generation} />
  );
}

const shortName = (game: Game) => game.name.replace(/^Pokémon /, '');

const joinNames = (names: string[]) =>
  names.length > 1
    ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`
    : (names[0] ?? '');

function AvailableCard({
  game,
  generation,
}: {
  game: Game;
  generation: string;
}) {
  const region = getRegion(game.region);
  if (!region) return null;

  const sharedWith = games.filter(
    (other) => other.region === game.region && other.id !== game.id,
  );
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
          <RegionTag name={region.name} />
        </Cover>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="font-semibold tracking-tight text-pretty">
                {game.name}
              </span>
              <span className="text-[13px] leading-5 text-muted-foreground">
                {region.name} · Generation {generation}
              </span>
            </div>
            <span className="inline-flex h-5.5 flex-none items-center gap-1.5 rounded-full border px-2 text-xs font-medium">
              <span className="size-1.5 rounded-full bg-[oklch(0.72_0.17_150)]" />
              Available
            </span>
          </div>
          {sharedWith.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link2 className="size-3.5 flex-none" />
              Same maps as {joinNames(sharedWith.map(shortName))}
            </span>
          )}
          <span className="mt-auto inline-flex h-11 items-center justify-center gap-1.5 rounded-[10px] border border-input bg-background text-sm font-medium transition-colors duration-200 group-hover/card:border-primary group-hover/card:bg-primary group-hover/card:text-primary-foreground group-focus-visible/card:border-primary group-focus-visible/card:bg-primary group-focus-visible/card:text-primary-foreground sm:h-9 dark:bg-input/30 dark:group-hover/card:bg-primary dark:group-focus-visible/card:bg-primary">
            Open map
            <ArrowRight className="size-4 transition-transform duration-260 ease-[cubic-bezier(.2,.8,.2,1)] group-hover/card:translate-x-1 group-focus-visible/card:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function UpcomingCard({
  game,
  generation,
}: {
  game: UpcomingGame;
  generation: string;
}) {
  return (
    <div
      aria-disabled="true"
      className="flex h-full cursor-not-allowed flex-col overflow-hidden rounded-2xl border border-dashed bg-muted/45 text-muted-foreground"
    >
      <ColorStripe colors={game.colors} className="opacity-35" />
      <Cover gameId={game.id} accent={game.colors[0]} muted />
      <div className="flex flex-1 flex-col gap-0.5 p-4">
        <div className="flex items-start justify-between gap-3">
          <span className="font-medium tracking-tight text-pretty">
            {game.title}
          </span>
          <span className="inline-flex h-5.5 flex-none items-center gap-1 rounded-full border px-2 text-xs font-medium">
            <Lock className="size-3" />
            Coming soon
          </span>
        </div>
        <span className="text-[13px] leading-5">
          {game.regionName} · Generation {generation}
        </span>
      </div>
    </div>
  );
}

function ColorStripe({
  colors,
  className,
}: {
  colors: string[];
  className?: string;
}) {
  return (
    <div className={cn('flex h-1 flex-none', className)}>
      {colors.map((color) => (
        <span key={color} className="flex-1" style={{ background: color }} />
      ))}
    </div>
  );
}

function Cover({
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
}) {
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
}

function RegionTag({ name }: { name: string }) {
  return (
    <span className="pointer-events-none absolute top-3 left-3 flex h-6.5 -translate-y-1.5 items-center gap-1.5 rounded-full bg-[oklch(0.145_0_0/0.78)] px-2.5 text-xs font-medium text-[oklch(0.985_0_0)] opacity-0 transition-[opacity,translate] duration-260 ease-[cubic-bezier(.2,.8,.2,1)] group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-visible/card:translate-y-0 group-focus-visible/card:opacity-100">
      <span
        className="size-1.5 rounded-full"
        style={{ background: 'var(--card-accent)' }}
      />
      {name}
    </span>
  );
}
