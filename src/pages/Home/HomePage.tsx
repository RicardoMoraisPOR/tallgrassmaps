import '@fontsource/barlow/400.css';
import { useRef, useState } from 'react';

import { ArrowRight, Award } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { Link } from 'react-router';

import { Container } from '@/components/Container';
import { Button } from '@/components/ui/button';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

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

const headlineLines = ['The', 'Definitive', 'Pokémon Atlas'];
const HEADLINE_SECONDS = 0.6;
const HEADLINE_STAGGER_SECONDS = 0.08;
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const riseIn = (delay: number) => ({
  className:
    'animate-in fill-mode-backwards fade-in slide-in-from-bottom-4 duration-600 will-change-[transform,opacity]',
  style: {
    animationDelay: `${delay}s`,
    animationTimingFunction: `cubic-bezier(${EASE_OUT_EXPO.join(',')})`,
  },
});

const FADE_OUT =
  'transition-opacity duration-500 group-data-[egg=true]/hero:pointer-events-none group-data-[egg=true]/hero:opacity-0';

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
      <Container className="relative grid max-w-[88rem] flex-1 content-center gap-x-12 gap-y-8 px-4 pt-10 pb-10 sm:px-8 sm:pt-14 sm:pb-12 lg:grid-cols-12 lg:gap-y-10 lg:px-12">
        <h1
          className={`font-heading text-[clamp(2.75rem,11.5vw,5.5rem)] leading-[0.9] font-bold tracking-[-0.03em] lg:col-span-8 lg:self-center lg:text-[clamp(3.75rem,6.2vw,7.25rem)] ${FADE_OUT}`}
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
        </h1>
        <HeroDiorama onReveal={reveal} revealed={Boolean(egg)} />
        <div
          className={`col-span-full flex flex-col items-start gap-5 ${FADE_OUT}`}
        >
          <m.p
            className="max-w-[50ch] font-['Barlow',sans-serif] text-base leading-snug font-normal text-pretty text-muted-foreground sm:text-lg"
            {...rise(0.7, 16)}
          >
            Explore the Pokémon games on interactive maps, designed to give you
            an accurate and effortless way to explore, without feeling like you
            left the game.
          </m.p>
          <div className="flex w-full max-w-sm flex-col gap-3">
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
        </div>
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
      <Container className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 pt-6 pb-8 text-[13px] leading-5 text-muted-foreground">
        <p className="max-w-160 text-pretty">
          This is a fan project. It isn&apos;t affiliated with Nintendo, Game
          Freak, Creatures Inc. or The Pokémon Company, who own Pokémon and
          everything related to it.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="group text-foreground"
          asChild
        >
          <Link to="/credits">
            <Award aria-hidden />
            Credits
            <ArrowRight
              aria-hidden
              className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </Link>
        </Button>
      </Container>
    </footer>
  );
};
