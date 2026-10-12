import '@fontsource/barlow/400.css';
import { useCallback, useRef, useState } from 'react';

import { ArrowRight } from 'lucide-react';
import { m } from 'motion/react';
import { Link } from 'react-router';

import { Container } from '@/components/Container';
import { Button } from '@/components/ui/button';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';

import { ChangelogCard } from './ChangelogCard';
import { HeroTileWalker } from './HeroTileWalker';

export const HomePage = () => {
  return (
    <>
      <Hero />
      <Footer />
    </>
  );
};

const headlineLines = ['The', 'Definitive', 'Pokémon Atlas'];
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const riseIn = (delay: number) => ({
  className:
    'animate-in fill-mode-backwards fade-in slide-in-from-bottom-4 duration-900',
  style: {
    animationDelay: `${delay}s`,
    animationTimingFunction: `cubic-bezier(${EASE_OUT_EXPO.join(',')})`,
  },
});

const Hero = () => {
  const reducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [launched, setLaunched] = useState(false);

  const launch = useCallback(() => setLaunched(true), []);

  const reveal = (delay: number, y: number) => ({
    initial: reducedMotion ? false : { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease: EASE_OUT_EXPO },
  });

  return (
    <section
      data-hero
      className="relative isolate flex flex-1 flex-col overflow-hidden border-b"
    >
      <Container
        ref={containerRef}
        className="relative grid max-w-[88rem] flex-1 content-center gap-x-12 gap-y-8 px-4 pt-10 pb-10 sm:px-8 sm:pt-14 sm:pb-12 lg:grid-cols-12 lg:gap-y-10 lg:px-12"
      >
        <h1 className="font-heading text-[clamp(2.75rem,11.5vw,5.5rem)] leading-[0.9] font-bold tracking-[-0.03em] lg:col-span-8 lg:self-center lg:text-[clamp(3.75rem,6.2vw,7.25rem)]">
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
                  duration: 1,
                  delay: 0.1 + index * 0.12,
                  ease: EASE_OUT_EXPO,
                }}
                style={{ transformOrigin: 'left bottom' }}
                onAnimationComplete={
                  index === headlineLines.length - 1
                    ? () => setArmed(true)
                    : undefined
                }
              >
                {line}
                {index === headlineLines.length - 1 && (
                  <span
                    ref={markerRef}
                    className={cn(
                      'ml-[0.04em] inline-block size-[0.16em] transition-colors duration-300',
                      launched ? 'bg-foreground' : 'bg-brand',
                    )}
                  />
                )}
              </m.span>
            </span>
          ))}
        </h1>
        <div
          ref={stageRef}
          aria-hidden
          className="h-44 lg:col-span-4 lg:aspect-[10/9] lg:h-auto lg:self-center"
        />
        <div className="col-span-full flex flex-col items-start gap-5">
          <m.p
            className="max-w-[50ch] font-['Barlow',sans-serif] text-base leading-snug font-normal text-pretty text-muted-foreground sm:text-lg"
            {...reveal(0.9, 16)}
          >
            Explore the Pokémon games on interactive maps, designed to give you
            an accurate and effortless way to explore, without feeling like you
            left the game.
          </m.p>
          <div className="flex w-full max-w-sm flex-col gap-3">
            <div {...riseIn(1.05)}>
              <Button size="lg" className="w-full" asChild>
                <Link to="/maps">
                  Explore maps
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            </div>
            <div {...riseIn(1.17)}>
              <ChangelogCard />
            </div>
          </div>
        </div>
        {!reducedMotion && (
          <HeroTileWalker
            containerRef={containerRef}
            startRef={markerRef}
            stageRef={stageRef}
            armed={armed}
            onLaunch={launch}
          />
        )}
      </Container>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="border-t">
      <Container className="flex flex-wrap items-start justify-between gap-x-8 gap-y-3 pt-6 pb-8 text-[13px] leading-5 text-muted-foreground">
        <p className="max-w-160 text-pretty">
          This is a fan project. It isn&apos;t affiliated with Nintendo, Game
          Freak, Creatures Inc. or The Pokémon Company, who own Pokémon and
          everything related to it.
        </p>
        <Link
          to="/credits"
          className="text-foreground underline underline-offset-3"
        >
          Credits
        </Link>
      </Container>
    </footer>
  );
};
