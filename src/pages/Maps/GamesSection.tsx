import { AnimatePresence, m } from 'motion/react';

import { Container } from '@/components/Container';
import { generationRegions } from '@/data/catalog/entries';
import type { CatalogEntry } from '@/data/catalog/types';
import { easeOutSoft } from '@/lib/motion';
import { generationId } from '@/lib/paths';
import { formatList } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings';

import { filterGenerations, groupByMap, totalGames } from './filters';
import { GameCard } from './GameCard';
import { GameFilters } from './GameFilters';
import { MapCard } from './MapCard';
import { type MapsView, useFilters } from './useFilters';

const STAGGER_SECONDS = 0.02;
const MAX_STAGGERED_ITEMS = 8;

const VIEWS: Array<{ value: MapsView; label: string }> = [
  { value: 'map', label: 'By Map' },
  { value: 'generation', label: 'By Generation' },
];

type Section = {
  key: string;
  id?: string;
  title?: string;
  subtitle?: string;
  entries: Array<CatalogEntry>;
};

const exitTransition = { duration: 0.12, ease: 'easeOut' } as const;

const results = {
  exit: { transition: { when: 'afterChildren' } },
} as const;

const chainItem = {
  initial: { opacity: 0, y: 32 },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: easeOutSoft,
      delay: Math.min(index, MAX_STAGGERED_ITEMS) * STAGGER_SECONDS,
    },
  }),
  exit: { opacity: 0, y: -24, transition: exitTransition },
};

export const GamesSection = () => {
  const { filters, groups, active, view, setView, toggle, clear } =
    useFilters();
  const animations = useSettingsStore((state) => state.animations);

  const generations = filterGenerations(filters);
  const shown = generations.reduce(
    (sum, { entries }) => sum + entries.length,
    0,
  );
  const allEntries = generations.flatMap(({ entries }) => entries);
  const visible: Array<Section> =
    view === 'map'
      ? allEntries.length > 0
        ? [{ key: 'maps', entries: allEntries }]
        : []
      : generations.map((generation) => ({
          key: `generation-${generation.number}`,
          id: generationId(generation.number),
          title: `Generation ${generation.roman}`,
          subtitle: formatList(generationRegions(generation)),
          entries: generation.entries,
        }));
  const resultsKey = [
    view,
    ...groups.map(({ key }) => filters[key].join(',')),
  ].join('|');

  let chainIndex = 0;

  return (
    <section aria-label="Games">
      <Container className="flex flex-col gap-10 pb-18">
        <div className="flex flex-col gap-8 border-b pb-4">
          <GameFilters
            groups={groups}
            leading={
              <div
                role="group"
                aria-label="Group games"
                className="inline-flex w-fit rounded-full border p-0.5"
              >
                {VIEWS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={view === value}
                    onClick={() => setView(value)}
                    className={`h-8 rounded-full px-4 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
                      view === value
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            }
            filters={filters}
            active={active}
            shown={shown}
            total={totalGames}
            onToggle={toggle}
            onClear={clear}
          />
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={resultsKey}
            className="flex flex-col gap-14"
            variants={animations ? results : undefined}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {visible.map((section) => (
              <div
                key={section.key}
                id={section.id}
                className="flex scroll-mt-6 flex-col gap-5"
              >
                {section.title && (
                  <m.div
                    variants={animations ? chainItem : undefined}
                    custom={chainIndex++}
                    className="flex items-center gap-4"
                  >
                    <h3 className="text-xl font-semibold tracking-tight whitespace-nowrap">
                      {section.title}{' '}
                      <span className="font-normal text-muted-foreground">
                        · {section.subtitle}
                      </span>
                    </h3>
                    <span className="h-px flex-1 bg-border" />
                  </m.div>
                )}
                <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-5">
                  {view === 'map'
                    ? groupByMap(section.entries).map((group) => (
                        <m.div
                          key={group.versionGroup}
                          variants={animations ? chainItem : undefined}
                          custom={chainIndex++}
                        >
                          <MapCard
                            versionGroup={group.versionGroup}
                            entries={group.entries}
                          />
                        </m.div>
                      ))
                    : section.entries.map((entry) => (
                        <m.div
                          key={entry.id}
                          variants={animations ? chainItem : undefined}
                          custom={chainIndex++}
                        >
                          <GameCard entry={entry} />
                        </m.div>
                      ))}
                </div>
              </div>
            ))}
            {visible.length === 0 && (
              <m.div
                variants={animations ? chainItem : undefined}
                custom={0}
                className="flex flex-col items-center gap-3 py-10 text-center text-muted-foreground"
              >
                No games match these filters.
                <button
                  type="button"
                  onClick={clear}
                  className="h-9 rounded-full border border-input px-4 text-xs font-medium text-foreground hover:bg-muted"
                >
                  Clear filters
                </button>
              </m.div>
            )}
          </m.div>
        </AnimatePresence>
      </Container>
    </section>
  );
};
