import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

import { getCover } from '@/data/covers';
import type { Game } from '@/data/games';
import type { Location, Region } from '@/data/maps';
import { gameHref, trailPath } from '@/lib/paths';
import { cn } from '@/lib/utils';

import { GameSwitcher } from './GameSwitcher';
import { MapSwitcher } from './MapSwitcher';

const TOWN_MAP = 'Town Map';

const crumbLink =
  'rounded-sm underline-offset-3 hover:text-foreground hover:underline';

type Crumb = {
  name: string;
  href: string;
};

type PageHeaderProps = {
  game: Game;
  region: Region;
  trail: Array<Location>;
  href: (path: string) => string;
};

export const PageHeader = ({ game, region, trail, href }: PageHeaderProps) => {
  const cover = getCover(game.id);
  const location = trail.at(-1);
  const title = location?.name ?? region.name;
  const current = location?.name ?? TOWN_MAP;
  const parents: Array<Crumb> = location
    ? [
        { name: TOWN_MAP, href: gameHref(game.id) },
        ...trail.slice(0, -1).map((step, index) => ({
          name: step.name,
          href: href(trailPath(trail.slice(0, index + 1))),
        })),
      ]
    : [];
  const folded = (index: number) => index < parents.length - 1;
  const hasFolded = parents.length > 1;

  return (
    <header className="flex items-center gap-4 sm:gap-5">
      {cover && (
        <img
          src={cover}
          alt={`${game.fullName} box art`}
          className="h-18 w-auto flex-none rounded-md border shadow-[0_8px_20px_-10px_oklch(0_0_0/0.45)] sm:h-24"
        />
      )}
      <div className="flex min-w-0 flex-col gap-2">
        <nav aria-label="Breadcrumb">
          <ol className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-muted-foreground">
            <li className="flex items-center">
              <MapSwitcher game={game} path={trailPath(trail)} />
            </li>
            <li className="flex items-center gap-1.5">
              <Separator />
              <GameSwitcher game={game} path={trailPath(trail)} />
            </li>
            {hasFolded && (
              <li aria-hidden className="flex items-center gap-1.5 sm:hidden">
                <Separator />…
              </li>
            )}
            {parents.map((crumb, index) => (
              <li
                key={crumb.href}
                className={cn(
                  'items-center gap-1.5',
                  folded(index) ? 'hidden sm:flex' : 'flex',
                )}
              >
                <Separator />
                <Link to={crumb.href} className={crumbLink}>
                  {crumb.name}
                </Link>
              </li>
            ))}
            <li className="hidden items-center gap-1.5 sm:flex">
              <Separator />
              <span aria-current="page" className="font-medium text-foreground">
                {current}
              </span>
            </li>
          </ol>
        </nav>
        <h1 className="font-heading text-4xl leading-[1.05] font-bold tracking-[-0.035em] sm:text-5xl">
          {title}
        </h1>
      </div>
    </header>
  );
};

const Separator = ({ className }: { className?: string }) => {
  return (
    <ChevronRight
      aria-hidden
      className={cn('size-3.5 opacity-60', className)}
    />
  );
};
