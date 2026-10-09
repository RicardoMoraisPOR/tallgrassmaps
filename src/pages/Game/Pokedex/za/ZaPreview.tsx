import { Fragment, useState } from 'react';

import { ChevronDown } from 'lucide-react';
import { m, useReducedMotionConfig } from 'motion/react';

import { megaStoneSprite } from '@/data/sprites';
import { useMegaSprite, usePokemonSprite } from '@/hooks/usePokemonSprite';
import { cn } from '@/lib/utils';

import { MegaEvolutions } from '../MegaEvolutions';
import type { PokedexRowProps } from '../types';
import { ZaBall } from './ZaBall';
import { ZaDetails } from './ZaDetails';
import { ZaTypeTags } from './ZaTypeTags';

type ZaPreviewProps = PokedexRowProps & {
  detailsOpen: boolean;
  onToggleDetails: () => void;
};

const snap = [0.16, 1, 0.3, 1] as const;
const flickerTimes = [0, 0.25, 0.4, 0.55, 0.7, 1];

export const ZaPreview = ({
  detailsOpen,
  onToggleDetails,
  ...context
}: ZaPreviewProps) => {
  const { entry, game } = context;
  const [activeMega, setActiveMega] = useState<number>();
  const spriteFor = usePokemonSprite(game);
  const megaSpriteFor = useMegaSprite();
  const reducedMotion = useReducedMotionConfig();

  const megas = entry.megas ?? [];
  const sprites = [
    spriteFor(entry.number),
    ...megas.map(({ form }) => megaSpriteFor(entry.number, form)),
  ];
  const spriteIndex = activeMega === undefined ? 0 : activeMega + 1;
  const hiddenSprite = {
    clipPath: 'inset(100% 0 0 0)',
    opacity: 0,
    filter: 'brightness(2.4) saturate(0.4)',
  };
  const shownSprite = {
    clipPath: 'inset(0% 0 0 0)',
    opacity: reducedMotion ? 1 : [0, 1, 0.5, 1, 0.8, 1],
    filter: 'brightness(1) saturate(1)',
  };
  const transition = (delay: number, duration = 0.32) => ({
    duration: reducedMotion ? 0 : duration,
    delay: reducedMotion ? 0 : delay,
    ease: snap,
  });
  const slideIn = (delay: number) => ({
    initial: { opacity: 0, x: -28, clipPath: 'inset(0 100% 0 0)' },
    animate: { opacity: 1, x: 0, clipPath: 'inset(0 0% 0 0)' },
    transition: transition(delay),
  });

  const stones = (className: string) =>
    megas.length > 0 && (
      <div role="radiogroup" aria-label="Form" className={className}>
        {megas.map(({ stone }, index) => {
          const active = activeMega === index;

          return (
            <button
              key={stone}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={stone}
              title={stone}
              onClick={() => setActiveMega(active ? undefined : index)}
              className={cn(
                'flex size-7 items-center justify-center rounded-lg border border-white/25 bg-(--za-tile) shadow-md shadow-black/25 outline-none transition-colors hover:bg-(--za-tile-hover) focus-visible:ring-2 focus-visible:ring-(--za-green) lg:size-14',
                active && 'border-white bg-white hover:bg-white',
              )}
            >
              <img
                src={megaStoneSprite(stone)}
                alt=""
                width={40}
                height={40}
                className="size-5 object-contain lg:size-10"
              />
            </button>
          );
        })}
      </div>
    );

  return (
    <section
      aria-label={`${entry.name} entry`}
      className="flex max-h-[42svh] flex-none flex-col gap-2 px-4 pb-2 lg:max-h-none lg:min-h-0 lg:w-[42%] lg:gap-4 lg:px-8 lg:pb-6"
    >
      <div className="flex flex-none items-start gap-3 lg:flex-col lg:items-center lg:gap-5">
        <div className="relative size-20 flex-none lg:size-56">
          <m.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={transition(0, 0.3)}
            className="relative size-full overflow-hidden rounded-2xl border border-white/20 bg-(--za-tile) shadow-lg shadow-black/25"
          >
            {sprites.map((form, index) => {
              const active = index === spriteIndex;

              return (
                <Fragment key={form.src}>
                  <m.img
                    src={form.src}
                    alt=""
                    width={288}
                    height={288}
                    initial={hiddenSprite}
                    animate={active ? shownSprite : hiddenSprite}
                    transition={
                      active
                        ? {
                            ...transition(0.05, 0.6),
                            opacity: {
                              ...transition(0.05, 0.6),
                              times: flickerTimes,
                            },
                          }
                        : { duration: 0 }
                    }
                    className={cn(
                      'absolute inset-0 size-full object-contain',
                      (form.pixelated || form.pixelArt) && 'pixelated',
                    )}
                  />
                  {!reducedMotion && (
                    <m.div
                      aria-hidden
                      initial={{ top: '100%', opacity: 0 }}
                      animate={
                        active
                          ? { top: '0%', opacity: [1, 1, 0] }
                          : { top: '100%', opacity: 0 }
                      }
                      transition={
                        active
                          ? { duration: 0.6, delay: 0.05, ease: 'easeOut' }
                          : { duration: 0 }
                      }
                      className="pointer-events-none absolute inset-x-0 h-0.5 bg-(--za-glow) shadow-[0_0_14px_3px_var(--za-glow)]"
                    />
                  )}
                </Fragment>
              );
            })}
          </m.div>
          {stones(
            'absolute top-0 -right-16 z-10 hidden flex-col gap-2 lg:flex',
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 lg:flex-none lg:items-center lg:gap-2">
          <m.span
            {...slideIn(0.12)}
            className="inline-flex items-center gap-2 self-start rounded-md bg-(--za-deep)/80 py-0.5 pr-3 pl-2 text-base font-bold tabular-nums lg:gap-3 lg:self-center lg:py-1 lg:pr-4 lg:pl-3 lg:text-lg"
          >
            <ZaBall className="size-4 lg:size-5" />
            <span aria-hidden className="h-4 w-px bg-white/40 lg:h-5" />
            {String(entry.id).padStart(3, '0')}
          </m.span>
          <div className="flex min-w-0 items-center gap-2 lg:contents">
            <m.h3
              {...slideIn(0.18)}
              className="min-w-0 truncate text-lg font-bold lg:text-3xl"
            >
              {entry.name}
            </m.h3>
            <m.div {...slideIn(0.24)} className="flex-none">
              <ZaTypeTags
                types={
                  (activeMega !== undefined && megas[activeMega]?.types) ||
                  entry.types
                }
              />
            </m.div>
          </div>
          {stones('flex flex-none gap-2 lg:hidden')}
          {megas.length === 0 && (
            <div aria-hidden className="h-7 flex-none lg:hidden" />
          )}
        </div>
      </div>
      <button
        type="button"
        aria-expanded={detailsOpen}
        onClick={onToggleDetails}
        className="group inline-flex flex-none items-center gap-2 self-center rounded-md text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-(--za-green) lg:hidden"
      >
        Check Entry
        <ChevronDown
          aria-hidden
          className="size-4 transition-transform group-aria-expanded:rotate-180"
        />
      </button>
      <m.div
        initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
        animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
        transition={transition(0.28, 0.5)}
        data-vaul-no-drag
        className={cn(
          'min-h-0 flex-1 flex-col gap-3 overflow-y-auto rounded-xl border border-white/20 bg-black/25 p-3 lg:flex lg:gap-4 lg:p-4',
          detailsOpen ? 'flex' : 'hidden',
        )}
      >
        <MegaEvolutions entry={entry} TypeTags={ZaTypeTags} />
        <ZaDetails {...context} />
      </m.div>
    </section>
  );
};
