import type { UpcomingGame } from '@/data/catalog/types';

import { GameSwitcher } from '../GameSwitcher';
import { MapSwitcher } from '../MapSwitcher';
import { Separator } from '../PageHeader';

export const UpcomingHeader = ({ game }: { game: UpcomingGame }) => (
  <div className="absolute top-4 left-4 z-20 flex max-w-[calc(100%-6rem)] flex-col items-start gap-2 lg:max-w-[min(48rem,calc(100%-26rem))]">
    <header className="flex max-w-full items-center gap-3 rounded-sm border bg-card p-3 sm:gap-4">
      <nav aria-label="Breadcrumb">
        <ol className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
          <li className="flex items-center">
            <MapSwitcher game={game} path="" />
          </li>
          <li className="flex items-center gap-1.5">
            <Separator />
            <GameSwitcher game={game} path="" />
          </li>
        </ol>
      </nav>
    </header>
  </div>
);
