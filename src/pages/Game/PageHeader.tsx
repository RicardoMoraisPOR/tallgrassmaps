import { ChevronLeft, ChevronRight, MapPinned } from 'lucide-react';
import { m } from 'motion/react';
import { Link } from 'react-router';

import { getCover } from '@/data/covers';
import type { Game } from '@/data/games';
import type { Location, Region } from '@/data/maps';
import { gameHref, trailPath } from '@/lib/paths';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings';

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
  floating?: boolean;
};

export const PageHeader = ({
  game,
  region,
  trail,
  href,
  floating = false,
}: PageHeaderProps) => {
  const animations = useSettingsStore((state) => state.animations);
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
  const back = parents.at(-1);
  const toRegion = region.navigation === 'seamless' && parents.length === 1;
  const backLabel = toRegion ? `Show ${region.name}` : back?.name;
  const BackIcon = toRegion ? MapPinned : ChevronLeft;

  return (
    <m.div
      layout={animations ? 'position' : false}
      className={cn(
        'flex flex-col items-start gap-3',
        floating
          ? 'absolute top-4 left-4 z-20 max-w-[calc(100%-6rem)] gap-2 lg:max-w-[min(48rem,calc(100%-26rem))]'
          : 'items-stretch sm:items-start',
      )}
    >
      <header
        className={cn(
          'flex max-w-full items-center gap-4 sm:gap-5',
          floating
            ? 'gap-3 rounded-[14px] border bg-card p-3 sm:gap-4'
            : 'pr-12 sm:pr-0',
        )}
      >
        {cover && (
          <img
            src={cover}
            alt={`${game.fullName} box art`}
            className={cn(
              'h-18 w-auto flex-none rounded-md border shadow-[0_8px_20px_-10px_oklch(0_0_0/0.45)]',
              floating ? 'h-14 sm:h-16' : 'sm:h-24',
            )}
          />
        )}
        <div className="flex min-w-0 flex-col gap-2">
          <nav aria-label="Breadcrumb" className="hidden sm:block">
            <ol className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-muted-foreground">
              <li className="flex items-center">
                <MapSwitcher game={game} path={trailPath(trail)} />
              </li>
              <li className="flex items-center gap-1.5">
                <Separator />
                <GameSwitcher game={game} path={trailPath(trail)} />
              </li>
              {parents.map((crumb) => (
                <li key={crumb.href} className="flex items-center gap-1.5">
                  <Separator />
                  <Link to={crumb.href} className={crumbLink}>
                    {crumb.name}
                  </Link>
                </li>
              ))}
              <li className="flex items-center gap-1.5">
                <Separator />
                <span
                  aria-current="page"
                  className="font-medium text-foreground"
                >
                  {current}
                </span>
              </li>
            </ol>
          </nav>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground sm:hidden">
            <MapSwitcher game={game} path={trailPath(trail)} />
            <GameSwitcher game={game} path={trailPath(trail)} />
          </div>
          <h1
            className={cn(
              'font-heading leading-[1.05] font-bold tracking-[-0.035em]',
              'text-balance',
              floating ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-5xl',
            )}
          >
            {title}
          </h1>
        </div>
      </header>
      {back && !(toRegion && floating) && (
        <Link
          to={back.href}
          aria-label={toRegion ? backLabel : `Back to ${back.name}`}
          className={cn(
            'flex min-h-9 w-fit max-w-full items-center gap-1 rounded-[10px] border bg-card py-1 pr-3 pl-2 text-[13px] font-medium outline-offset-2 hover:bg-muted sm:hidden',
            !floating && 'self-center',
          )}
        >
          <BackIcon aria-hidden className="size-4 flex-none" />
          <span className="truncate">{backLabel}</span>
        </Link>
      )}
    </m.div>
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
