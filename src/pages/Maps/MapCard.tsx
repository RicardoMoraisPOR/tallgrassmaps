import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

import { ColorStripe } from '@/components/GameCover';
import { OverlayPill } from '@/components/OverlayPill';
import { entryName, entryRegionLabels } from '@/data/catalog/entries';
import type { CatalogEntry } from '@/data/catalog/types';
import { getCover } from '@/data/covers';
import { cn, formatList } from '@/lib/utils';

const COVER_OVERLAP = '-ml-8';

const shortTitle = (entry: CatalogEntry) =>
  entryName(entry).replace(/^Pokémon /, '');

const ROW_CLASS =
  'flex h-11 items-center justify-between gap-2 rounded-sm border border-input bg-background px-3 text-sm font-medium transition-colors duration-200 sm:h-9 dark:bg-input/30';

const GameRow = ({ entry }: { entry: CatalogEntry }) => {
  return (
    <Link
      to={`/${entry.id}`}
      aria-label={`Open ${entryName(entry)}`}
      className={cn(
        ROW_CLASS,
        'outline-none hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:ring-3 focus-visible:ring-ring/55 dark:hover:bg-primary',
      )}
    >
      {shortTitle(entry)}
      <ArrowRight aria-hidden className="size-4" />
    </Link>
  );
};

type MapCardProps = {
  versionGroup: string;
  entries: Array<CatalogEntry>;
};

export const MapCard = ({ versionGroup, entries }: MapCardProps) => {
  const covers = entries.flatMap((entry) => {
    const cover = getCover(entry.id);

    return cover ? [{ id: entry.id, cover }] : [];
  });
  const sideBySide = covers.length === 2;
  const regions = [...new Set(entries.flatMap(entryRegionLabels))];
  const colors = entries.flatMap((entry) => entry.colors[0] ?? []);

  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-lg border shadow-xs',
        'bg-card',
      )}
    >
      <ColorStripe colors={colors} />
      <div
        className={cn(
          'relative aspect-16/10 shrink-0 overflow-hidden border-b bg-muted',
        )}
      >
        {covers[0] && (
          <img
            src={covers[0].cover}
            alt=""
            aria-hidden
            className="absolute inset-0 size-full scale-125 object-cover opacity-60 blur-xl"
          />
        )}
        <div
          className={cn(
            'relative flex size-full items-center justify-center py-3',
            sideBySide && 'gap-3',
          )}
        >
          {covers.map(({ id, cover }, index) => (
            <img
              key={id}
              src={cover}
              alt=""
              loading="lazy"
              className={cn(
                'relative object-contain drop-shadow-[0_6px_14px_oklch(0_0_0/0.35)]',
                'h-[80%]',
                !sideBySide && index > 0 && COVER_OVERLAP,
              )}
              style={{ zIndex: covers.length - index }}
            />
          ))}
        </div>
        <OverlayPill className="left-2.5 z-10">{versionGroup} map</OverlayPill>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="font-semibold tracking-tight text-pretty">
            {formatList(entries.map(shortTitle))}
          </span>
          <span className="text-xs leading-5 text-muted-foreground">
            {formatList(regions)} · {entries[0].platform}
          </span>
        </div>
        <div className="mt-auto flex flex-col gap-2">
          {entries.map((entry) => (
            <GameRow key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
};
