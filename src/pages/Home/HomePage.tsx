import { useRef, useState } from 'react';

import { ArrowRight, Award } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { Link } from 'react-router';

import { Container } from '@/components/Container';
import { Button } from '@/components/ui/button';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { ENTER, enterDelay } from '@/lib/enter';
import { cn } from '@/lib/utils';

import { ChangelogCard } from './ChangelogCard';
import { HeroDiorama } from './diorama/HeroDiorama';
import { HeroEgg, type TileRect } from './diorama/HeroEgg';
import type { Bounds } from './diorama/Swarm';

export const HomePage = () => {
  return (
    <>
      <Hero />
      <Footer />
    </>
  );
};

const headlineLines = ['The', 'Interactive', 'Pokémon Atlas'];
const HEADLINE_SECONDS = 0.6;
const HEADLINE_STAGGER_SECONDS = 0.08;
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const LAYOUT_TRANSITION = { duration: 0.8, ease: EASE_OUT_EXPO };

const riseIn = (delay: number) => ({
  className: cn(ENTER, 'duration-600 will-change-[transform,opacity]'),
  style: {
    ...enterDelay(delay),
    animationTimingFunction: `cubic-bezier(${EASE_OUT_EXPO.join(',')})`,
  },
});

const LET_CLICKS_THROUGH =
  'group-data-[egg=true]/hero:pointer-events-none group-data-[egg=true]/hero:[&_a]:pointer-events-auto group-data-[egg=true]/hero:[&_button]:pointer-events-auto';

const Hero = () => {
  const reducedMotion = usePrefersReducedMotion();
  const section = useRef<HTMLElement>(null);
  const [egg, setEgg] = useState<{ from: TileRect; bounds: Bounds }>();
  const reveal = (tile: DOMRect) => {
    const box = section.current?.getBoundingClientRect();

    if (!box) return;

    setEgg({
      from: {
        left: tile.left - box.left,
        top: tile.top - box.top,
        width: tile.width,
        height: tile.height,
      },
      bounds: {
        width: section.current?.clientWidth ?? box.width,
        height: section.current?.clientHeight ?? box.height,
      },
    });
  };

  const rise = (delay: number, y: number) => ({
    initial: reducedMotion ? false : { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: EASE_OUT_EXPO },
    style: { willChange: 'transform, opacity' },
  });

  return (
    <section
      ref={section}
      data-hero
      data-egg={egg ? 'true' : 'false'}
      className="group/hero relative isolate flex flex-1 flex-col overflow-hidden border-b"
    >
      <Container
        size="full"
        className={`relative z-10 grid flex-1 content-center gap-x-12 gap-y-8 px-4 pt-10 pb-10 group-data-[egg=true]/hero:mx-0 group-data-[egg=true]/hero:max-w-none group-data-[egg=true]/hero:content-start group-data-[egg=true]/hero:pl-10 sm:px-8 sm:pt-14 sm:pb-12 sm:group-data-[egg=true]/hero:pl-14 lg:grid-cols-12 lg:gap-y-10 lg:px-12 lg:group-data-[egg=true]/hero:pl-14 ${LET_CLICKS_THROUGH}`}
      >
        <m.h1
          layout="position"
          transition={LAYOUT_TRANSITION}
          data-hero-obstacle="text"
          className={`font-heading text-[clamp(2.75rem,11.5vw,5.5rem)] leading-[0.9] font-bold tracking-[-0.03em] transition-[font-size] duration-300 ease-out group-data-[egg=true]/hero:text-[clamp(2rem,9vw,3.25rem)] lg:col-span-8 lg:self-center lg:text-[clamp(3.75rem,6.2vw,7.25rem)] lg:group-data-[egg=true]/hero:text-[clamp(2.75rem,4.2vw,4.5rem)]`}
        >
          {headlineLines.map((line, index) => (
            <span
              key={line}
              className="-my-[0.06em] block overflow-hidden py-[0.06em] whitespace-nowrap"
            >
              <m.span
                className="block"
                initial={reducedMotion ? false : { y: '110%', rotate: 3 }}
                animate={{ y: 0, rotate: 0 }}
                transition={{
                  duration: HEADLINE_SECONDS,
                  delay: 0.1 + index * HEADLINE_STAGGER_SECONDS,
                  ease: EASE_OUT_EXPO,
                }}
                style={{ transformOrigin: 'left bottom' }}
              >
                {line}
                {index === headlineLines.length - 1 && '.'}
              </m.span>
            </span>
          ))}
        </m.h1>
        <HeroDiorama onReveal={reveal} revealed={Boolean(egg)} />
        <m.div
          layout="position"
          transition={LAYOUT_TRANSITION}
          className="col-span-full flex flex-col items-start gap-5"
        >
          <m.p
            data-hero-obstacle="text"
            className="max-w-[50ch] text-base leading-snug font-normal text-pretty text-muted-foreground sm:text-lg"
            {...rise(0.7, 16)}
          >
            Explore the Pokémon games on interactive maps, designed to give you
            an accurate and effortless way to explore, without feeling like you
            left the game.
          </m.p>
          <div
            data-hero-obstacle="box"
            className="flex w-full max-w-sm flex-col gap-3"
          >
            <div {...riseIn(0.82)}>
              <Button size="lg" className="w-full" asChild>
                <Link to="/maps">
                  Explore maps
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            </div>
            <div {...riseIn(0.94)}>
              <ChangelogCard />
            </div>
          </div>
        </m.div>
      </Container>
      <AnimatePresence>
        {egg && (
          <HeroEgg
            key="egg"
            from={egg.from}
            initialBounds={egg.bounds}
            sectionRef={section}
            onClose={() => setEgg(undefined)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="border-t">
      <Container className="flex items-start justify-between gap-4 pt-4 pb-5 text-[11px] leading-4 text-muted-foreground sm:items-center sm:gap-8 sm:pt-6 sm:pb-8 sm:text-xs sm:leading-5">
        <p className="max-w-160 text-pretty">
          This is a fan project. It isn&apos;t affiliated with Nintendo, Game
          Freak, Creatures Inc. or The Pokémon Company, who own Pokémon and
          everything related to it.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="group shrink-0 text-foreground"
          asChild
        >
          <Link to="/credits">
            <Award aria-hidden />
            Credits
            <ArrowRight
              aria-hidden
              className="hidden transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none sm:block"
            />
          </Link>
        </Button>
      </Container>
    </footer>
  );
};
