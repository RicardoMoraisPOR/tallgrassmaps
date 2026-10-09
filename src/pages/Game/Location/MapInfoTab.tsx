import { type CSSProperties, useState } from 'react';

import { Settings2 } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { travelState } from '@/lib/motion';
import { cn } from '@/lib/utils';

import type { LayerEntry, LayerSection } from './links/types';
import { EmptyTab } from './LocationPanel';
import type { MapLayerId } from './mapLayers';
import { MapSettingsDialog } from './MapSettingsDialog';

type MapInfoTabProps = {
  sections: Array<LayerSection>;
  onHighlight: (key: string | undefined) => void;
  onOpen: (key: string) => void;
  hiddenLayers: Set<MapLayerId>;
};

const sectionTitles: Record<LayerSection['id'], string> = {
  interactions: 'On this place',
  exits: 'Navigation',
};

export const MapInfoTab = ({
  sections,
  onHighlight,
  onOpen,
  hiddenLayers,
}: MapInfoTabProps) => {
  if (sections.length === 0) return <EmptyTab>Nothing on this place.</EmptyTab>;

  return sections.map(({ id, groups }, index) => (
    <section
      key={id}
      aria-label={sectionTitles[id]}
      className={cn('flex flex-col gap-4', index > 0 && 'border-t pt-4')}
    >
      <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {sectionTitles[id]}
      </h2>
      {groups.map(({ layer, entries }) => (
        <div key={layer.id} className="flex flex-col gap-2">
          <h3 className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <span
              aria-hidden
              className="size-3 rounded-[3px] border-2 border-(--layer) bg-(--layer)/30"
              style={{ '--layer': layer.color } as CSSProperties}
            />
            {layer.label}
          </h3>
          <ul className="flex flex-wrap gap-1.5">
            {entries.map((entry) => (
              <li key={entry.key} className="max-w-full min-w-0">
                <EntryChip
                  entry={entry}
                  onHighlight={onHighlight}
                  onOpen={hiddenLayers.has(layer.id) ? undefined : onOpen}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  ));
};

const chipClassName =
  'flex h-7 max-w-full items-center rounded-full border px-2.5 text-[13px] transition-colors';

const EntryChip = ({
  entry,
  onHighlight,
  onOpen,
}: {
  entry: LayerEntry;
  onHighlight: (key: string | undefined) => void;
  onOpen?: (key: string) => void;
}) => {
  const target = entry.target ?? entry.key;
  const highlightHandlers = {
    onMouseEnter: () => onHighlight(target),
    onMouseLeave: () => onHighlight(undefined),
    onFocus: () => onHighlight(target),
    onBlur: () => onHighlight(undefined),
  };
  const name = <span className="truncate">{entry.name}</span>;

  if (!entry.href && entry.opens && onOpen)
    return (
      <button
        type="button"
        title={entry.name}
        onClick={() => onOpen(target)}
        className={`${chipClassName} cursor-pointer hover:bg-muted`}
        {...highlightHandlers}
      >
        {name}
      </button>
    );

  if (!entry.href)
    return (
      <span title={entry.name} className={chipClassName} {...highlightHandlers}>
        {name}
      </span>
    );

  return (
    <Link
      to={entry.href}
      state={travelState(entry.travel)}
      replace={entry.replace}
      preventScrollReset={entry.replace}
      className={`${chipClassName} hover:bg-muted`}
      {...highlightHandlers}
    >
      {name}
    </Link>
  );
};

export const MapLayerSettingsButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        className="w-full"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <Settings2 aria-hidden />
        Map Layer Settings
      </Button>
      <MapSettingsDialog open={open} onOpenChange={setOpen} />
    </>
  );
};
