import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router';

import type { Game } from '@/data/games';
import type { Location } from '@/data/maps';
import { cn } from '@/lib/utils';

import { breadcrumbParents } from './breadcrumbs';

type BackLinkProps = {
  game: Game;
  trail: Array<Location>;
  href: (path: string) => string;
  fullWidth?: boolean;
};

export const BackLink = ({
  game,
  trail,
  href,
  fullWidth = false,
}: BackLinkProps) => {
  const parents = breadcrumbParents(game, trail, href);
  const back = parents.at(-1);

  if (!back || parents.length === 1) return null;

  return (
    <Link
      to={back.href}
      aria-label={`Back to ${back.name}`}
      className={cn(
        'flex max-w-full items-center gap-1 rounded-[10px] border bg-card py-1 pr-3 pl-2 text-[13px] font-medium outline-offset-2 hover:bg-muted sm:hidden',
        fullWidth ? 'min-h-11 w-full justify-center' : 'min-h-9 w-fit',
      )}
    >
      <ChevronLeft aria-hidden className="size-4 flex-none" />
      <span className="truncate">{back.name}</span>
    </Link>
  );
};
