import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router';

import type { Game } from '@/data/games';
import type { Location, Region } from '@/data/maps';

import { breadcrumbParents } from './breadcrumbs';

type BackLinkProps = {
  game: Game;
  region: Region;
  trail: Array<Location>;
  href: (path: string) => string;
};

export const BackLink = ({ game, region, trail, href }: BackLinkProps) => {
  const parents = breadcrumbParents(game, region, trail, href);
  const back = parents.at(-1);

  if (!back) return null;

  return (
    <Link
      to={back.href}
      aria-label={`Back to ${back.name}`}
      className="flex min-h-9 w-fit max-w-full items-center gap-1 rounded-sm border bg-card py-1 pr-3 pl-2 text-xs font-medium outline-offset-2 hover:bg-muted sm:hidden"
    >
      <ChevronLeft aria-hidden className="size-4 flex-none" />
      <span className="truncate">{back.name}</span>
    </Link>
  );
};
