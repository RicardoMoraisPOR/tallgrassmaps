import { ChevronRight } from 'lucide-react';
import { m } from 'motion/react';
import { Link } from 'react-router';

import type { Game } from '@/data/games';
import type { Location, Region } from '@/data/maps';
import { trailPath } from '@/lib/paths';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings';

import { BackLink } from './BackLink';
import { breadcrumbParents } from './breadcrumbs';
import { GameSwitcher } from './GameSwitcher';
import { MapSwitcher } from './MapSwitcher';

const crumbLink =
  'rounded-sm underline-offset-3 hover:text-foreground hover:underline';

type PageHeaderProps = {
  game: Game;
  region: Region;
  trail: Array<Location>;
  hub: boolean;
  href: (path: string) => string;
};

export const PageHeader = ({
  game,
  region,
  trail,
  hub,
  href,
}: PageHeaderProps) => {
  const animations = useSettingsStore((state) => state.animations);
  const location = trail.at(-1);
  const title = hub ? game.fullName : (location?.name ?? region.name);
  const current = hub ? undefined : (location?.name ?? region.name);
  const parents = breadcrumbParents(game, region, trail, href);

  return (
    <m.div
      layout={animations ? 'position' : false}
      className={cn(
        'absolute top-4 left-4 z-20 flex max-w-[calc(100%-6rem)] flex-col items-start gap-2 lg:max-w-[min(48rem,calc(100%-26rem))]',
      )}
    >
      <header className="flex max-w-full items-center gap-3 rounded-lg border bg-card p-3 sm:gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <nav aria-label="Breadcrumb" className="hidden sm:block">
            <ol className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
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
              {current && (
                <li className="flex items-center gap-1.5">
                  <Separator />
                  <span
                    aria-current="page"
                    className="font-medium text-foreground"
                  >
                    {current}
                  </span>
                </li>
              )}
            </ol>
          </nav>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground sm:hidden">
            <MapSwitcher game={game} path={trailPath(trail)} />
            <GameSwitcher game={game} path={trailPath(trail)} />
          </div>
          {!hub && (
            <h1 className="font-heading text-2xl leading-[1.05] font-bold tracking-[-0.035em] text-balance sm:text-3xl">
              {title}
            </h1>
          )}
        </div>
      </header>
      <BackLink game={game} region={region} trail={trail} href={href} />
    </m.div>
  );
};

export const Separator = ({ className }: { className?: string }) => {
  return (
    <ChevronRight
      aria-hidden
      className={cn('size-3.5 opacity-60', className)}
    />
  );
};
