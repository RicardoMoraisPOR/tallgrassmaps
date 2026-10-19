import type { CSSProperties } from 'react';

import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

import { ColorStripe, Cover } from '@/components/GameCover';
import { OverlayPill } from '@/components/OverlayPill';
import {
  entryName,
  entryRegionLabels,
  entryVersionGroup,
} from '@/data/catalog/entries';
import type { CatalogEntry } from '@/data/catalog/types';
import { versionGroupNames } from '@/data/catalog/versionGroups';
import type { Platform } from '@/data/games';
import { formatList } from '@/lib/utils';

type GameCardProps = {
  entry: CatalogEntry;
};

export const GameCard = ({ entry }: GameCardProps) => {
  const accent = entry.colors[0];
  const versionGroup = entryVersionGroup(entry);

  if (!versionGroup) return null;

  return (
    <div
      className="group/card relative isolate block h-full rounded-sm"
      style={{ '--card-accent': accent } as CSSProperties}
    >
      <Link
        to={`/${entry.id}`}
        aria-label={`Open ${entryName(entry)}`}
        className="absolute inset-0 z-0 rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/55"
      />
      <div className="pointer-events-none relative z-10 flex h-full flex-col overflow-hidden rounded-sm border bg-card shadow-xs transition-colors duration-260 ease-[cubic-bezier(.2,.8,.2,1)] group-hover/card:border-[var(--card-accent)] group-has-[:focus-visible]/card:border-ring">
        <ColorStripe colors={entry.colors} />
        <Cover gameId={entry.id} accent={accent} interactive>
          <MapTag versionGroup={versionGroup} />
        </Cover>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="font-semibold tracking-tight text-pretty">
              {entryName(entry)}
            </span>
            <Details
              regions={entryRegionLabels(entry)}
              platform={entry.platform}
            />
          </div>
          <span className="mt-auto inline-flex h-11 items-center justify-center gap-1.5 rounded-sm border border-input bg-background text-sm font-medium transition-colors duration-200 group-hover/card:border-primary group-hover/card:bg-primary group-hover/card:text-primary-foreground group-focus-visible/card:border-primary group-focus-visible/card:bg-primary group-focus-visible/card:text-primary-foreground sm:h-9 dark:bg-input/30 dark:group-hover/card:bg-primary dark:group-focus-visible/card:bg-primary">
            Open game
            <ArrowRight className="size-4 transition-transform duration-260 ease-[cubic-bezier(.2,.8,.2,1)] group-hover/card:translate-x-1 group-focus-visible/card:translate-x-1" />
          </span>
        </div>
      </div>
    </div>
  );
};

const Details = ({
  regions,
  platform,
}: {
  regions: Array<string>;
  platform: Platform;
}) => {
  return (
    <span className="text-xs leading-5 text-muted-foreground">
      {formatList(regions)} · {platform}
    </span>
  );
};

const MapTag = ({ versionGroup }: { versionGroup: string }) => {
  return (
    <OverlayPill
      className="left-2.5"
      title={`Same maps in ${formatList(versionGroupNames(versionGroup))}`}
    >
      {versionGroup} map
    </OverlayPill>
  );
};
