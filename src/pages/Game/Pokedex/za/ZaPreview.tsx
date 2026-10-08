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

  return (
    <section
      aria-label={`${entry.name} entry`}
      className="flex max-h-[60svh] flex-none flex-col gap-3 px-4 pb-3 lg:max-h-none lg:min-h-0 lg:w-[42%] lg:gap-4 lg:px-8 lg:pb-6"
    >
      <div className="flex flex-none items-center gap-4 lg:flex-col lg:gap-5">
        <div className="relative size-24 flex-none lg:size-56">
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
          {megas.length > 0 && (
            <div
              role="radiogroup"
              aria-label="Form"
              className="absolute top-2 right-2 z-10 flex flex-col gap-1.5 lg:top-0 lg:-right-16 lg:gap-2"
            >
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
                      'flex size-9 items-center justify-center rounded-lg border border-white/25 bg-(--za-tile) shadow-md shadow-black/25 outline-none transition-colors hover:bg-(--za-tile-hover) focus-visible:ring-2 focus-visible:ring-(--za-green) lg:size-14',
                      active && 'border-white bg-white hover:bg-white',
                    )}
                  >
                    <img
                      src={megaStoneSprite(stone)}
                      alt=""
                      width={40}
                      height={40}
                      className="size-6 object-contain lg:size-10"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 lg:flex-none lg:items-center">
          <m.span
            {...slideIn(0.12)}
            className="inline-flex items-center gap-3 self-start rounded-md bg-(--za-deep)/80 py-1 pr-4 pl-3 text-lg font-bold tabular-nums lg:self-center"
          >
            <ZaBall className="size-5" />
            <span aria-hidden className="h-5 w-px bg-white/40" />
            {String(entry.id).padStart(3, '0')}
          </m.span>
          <m.h3
            {...slideIn(0.18)}
            className="truncate text-2xl font-bold lg:text-3xl"
          >
            {entry.name}
          </m.h3>
          <m.div {...slideIn(0.24)}>
            <ZaTypeTags types={entry.types} />
          </m.div>
        </div>
        <button
          type="button"
          aria-expanded={detailsOpen}
          onClick={onToggleDetails}
          className="group inline-flex flex-none items-center gap-2 rounded-md px-1 text-base font-bold outline-none focus-visible:ring-2 focus-visible:ring-(--za-green) lg:hidden"
        >
          <span
            aria-hidden
            className="inline-flex size-6 items-center justify-center rounded-full bg-white text-sm text-(--za-deep)"
          >
            A
          </span>
          Check Entry
          <ChevronDown
            aria-hidden
            className="size-4 transition-transform group-aria-expanded:rotate-180"
          />
        </button>
      </div>
      <m.div
        initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
        animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
        transition={transition(0.28, 0.5)}
        data-vaul-no-drag
        className={cn(
          'min-h-0 flex-1 flex-col gap-4 overflow-y-auto rounded-xl border border-white/20 bg-black/25 p-4 lg:flex',
          detailsOpen ? 'flex' : 'hidden',
        )}
      >
        <MegaEvolutions entry={entry} />
        <ZaDetails {...context} />
      </m.div>
    </section>
  );
};
