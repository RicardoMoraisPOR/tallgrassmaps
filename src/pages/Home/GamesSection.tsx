import { AnimatePresence, m } from 'motion/react';

import { Container } from '@/components/Container';
import { generationRegions } from '@/data/catalog';
import { easeOutSoft } from '@/lib/motion';
import { generationId } from '@/lib/paths';
import { formatList } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings';

import { filterGenerations, filterGroups, totalGames } from './filters';
import { GameCard } from './GameCard';
import { GameFilters } from './GameFilters';
import { useFilters } from './useFilters';

const STAGGER_SECONDS = 0.02;
const MAX_STAGGERED_ITEMS = 8;

const exitTransition = { duration: 0.12, ease: 'easeIn' } as const;

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
  const { filters, active, toggle, clear } = useFilters();
  const animations = useSettingsStore((state) => state.animations);

  const visible = filterGenerations(filters);
  const shown = visible.reduce((sum, { entries }) => sum + entries.length, 0);
  const resultsKey = filterGroups
    .map(({ key }) => filters[key].join(','))
    .join('|');

  let chainIndex = 0;

  return (
    <section
      id="games"
      aria-labelledby="games-heading"
      className="border-t bg-muted/40"
    >
      <Container className="flex flex-col gap-14 py-18">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2
              id="games-heading"
              className="font-heading text-[28px] leading-[1.1] font-bold tracking-[-0.03em] sm:text-4xl sm:leading-[1.1]"
            >
              Find your game
            </h2>
            <p className="max-w-[56ch] text-muted-foreground">
              Every main-series game in release order, grouped by generation.
              Pick yours and start on its Town Map.
            </p>
          </div>
          <GameFilters
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
            {visible.map((generation) => (
              <div
                key={generation.number}
                id={generationId(generation.number)}
                className="flex scroll-mt-6 flex-col gap-5"
              >
                <m.div
                  variants={animations ? chainItem : undefined}
                  custom={chainIndex++}
                  className="flex items-center gap-4"
                >
                  <h3 className="text-xl font-semibold tracking-tight whitespace-nowrap">
                    Generation {generation.roman}{' '}
                    <span className="font-normal text-muted-foreground">
                      · {formatList(generationRegions(generation))}
                    </span>
                  </h3>
                  <span className="h-px flex-1 bg-border" />
                </m.div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-5">
                  {generation.entries.map((entry) => (
                    <m.div
                      key={entry.game.id}
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
                  className="h-9 rounded-full border border-input px-4 text-[13px] font-medium text-foreground hover:bg-muted"
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
