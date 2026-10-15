import type { Game } from '@/data/games';
import { type Location, type Region, regionHref } from '@/data/maps';
import { trailPath } from '@/lib/paths';

export type Crumb = {
  name: string;
  href: string;
};

export const breadcrumbParents = (
  game: Game,
  region: Region,
  trail: Array<Location>,
  href: (path: string) => string,
): Array<Crumb> =>
  trail.length > 0
    ? [
        { name: region.name, href: regionHref(game.id, region) },
        ...trail.slice(0, -1).map((step, index) => ({
          name: step.name,
          href: href(trailPath(trail.slice(0, index + 1))),
        })),
      ]
    : [];
