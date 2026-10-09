import type { Game } from '@/data/games';
import type { Location } from '@/data/maps';
import { gameHref, trailPath } from '@/lib/paths';

export const TOWN_MAP = 'Town Map';

export type Crumb = {
  name: string;
  href: string;
};

export const breadcrumbParents = (
  game: Game,
  trail: Array<Location>,
  href: (path: string) => string,
): Array<Crumb> =>
  trail.length > 0
    ? [
        { name: TOWN_MAP, href: gameHref(game.id) },
        ...trail.slice(0, -1).map((step, index) => ({
          name: step.name,
          href: href(trailPath(trail.slice(0, index + 1))),
        })),
      ]
    : [];
