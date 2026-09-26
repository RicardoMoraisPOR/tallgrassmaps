import { Link } from 'react-router';

import type { Direction, LocationKind } from '@/data/maps';
import { travelState } from '@/lib/motion';
import { cn } from '@/lib/utils';

import { kindLabels } from '../places';

export type PlaceLink = {
  href: string;
  name: string;
  travel?: Direction;
};

export type PlaceLinkGroup = {
  label: string;
  links: PlaceLink[];
};

type PlaceCardProps = {
  kind: LocationKind;
  groups: PlaceLinkGroup[];
  className?: string;
};

export default function PlaceCard({ kind, groups, className }: PlaceCardProps) {
  const filled = groups.filter((group) => group.links.length > 0);

  return (
    <section
      aria-label={kindLabels[kind]}
      className={cn(
        'flex flex-col gap-4 rounded-[14px] border bg-card p-5',
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          {kindLabels[kind]}
        </span>
      </div>

      {filled.map(({ label, links }) => (
        <div key={label} className="flex flex-col gap-2">
          <span className="text-[13px] text-muted-foreground">{label}</span>
          <ul className="flex flex-wrap gap-1.5">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  state={travelState(link.travel)}
                  className="inline-flex h-7 items-center rounded-full border px-2.5 text-[13px] whitespace-nowrap transition-colors hover:bg-muted"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {filled.length === 0 && (
        <p className="text-[13px] text-muted-foreground">
          Nothing else to open here yet.
        </p>
      )}
    </section>
  );
}
