import { type KeyboardEvent, type ReactNode, useId, useRef } from 'react';

import { cn } from '@/lib/utils';
import { type LocationTab, useSettingsStore } from '@/stores/settings';

export type PanelTab = {
  id: LocationTab;
  label: string;
  count?: number;
  action?: ReactNode;
  content: ReactNode;
};

type LocationPanelProps = {
  tabs: Array<PanelTab>;
  className?: string;
};

export const LocationPanel = ({ tabs, className }: LocationPanelProps) => {
  const saved = useSettingsStore((state) => state.locationTab);
  const setSaved = useSettingsStore((state) => state.setLocationTab);
  const baseId = useId();
  const tabRefs = useRef(new Map<LocationTab, HTMLButtonElement>());

  const active = tabs.find((tab) => tab.id === saved) ?? tabs[0];
  const tabId = (id: LocationTab) => `${baseId}-tab-${id}`;
  const panelId = `${baseId}-panel`;

  const moveFocus = (event: KeyboardEvent, index: number) => {
    const offsets: Partial<Record<string, number>> = {
      ArrowRight: 1,
      ArrowLeft: -1,
    };
    const offset = offsets[event.key];

    if (offset === undefined) return;

    event.preventDefault();

    const next = tabs[(index + offset + tabs.length) % tabs.length];

    setSaved(next.id);
    tabRefs.current.get(next.id)?.focus();
  };

  if (!active) return null;

  return (
    <section
      aria-label="Location details"
      className={cn(
        'flex min-h-0 flex-col rounded-[14px] border bg-card',
        className,
      )}
    >
      <div className="sticky top-0 z-10 rounded-t-[14px] bg-card p-3 pb-0">
        <div
          role="tablist"
          aria-label="Location details"
          className="flex gap-1 rounded-xl border p-1"
        >
          {tabs.map((tab, index) => {
            const selected = tab.id === active.id;

            return (
              <button
                key={tab.id}
                ref={(node) => {
                  if (node) tabRefs.current.set(tab.id, node);
                  else tabRefs.current.delete(tab.id);
                }}
                type="button"
                role="tab"
                id={tabId(tab.id)}
                aria-selected={selected}
                aria-controls={panelId}
                tabIndex={selected ? 0 : -1}
                onClick={() => setSaved(tab.id)}
                onKeyDown={(event) => moveFocus(event, index)}
                className="inline-flex h-8 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 text-[13px] font-medium whitespace-nowrap text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-selected:bg-foreground aria-selected:text-background"
              >
                {tab.label}
                {Boolean(tab.count) && (
                  <span className="text-xs tabular-nums opacity-70">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      {active.action && <div className="px-5 pt-4">{active.action}</div>}
      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={tabId(active.id)}
        className="flex min-h-0 flex-col gap-4 overflow-y-auto p-5 contain-paint"
      >
        {active.content}
      </div>
    </section>
  );
};

export const EmptyTab = ({ children }: { children: ReactNode }) => {
  return <p className="text-[13px] text-muted-foreground">{children}</p>;
};
