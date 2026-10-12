import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { m } from 'motion/react';
import { useLocation } from 'react-router';

import { Container } from '@/components/Container';
import { Logo } from '@/components/Logo';
import { coverSources } from '@/data/covers';
import { pokemonSpriteSources } from '@/data/sprites';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';

import { ChangelogBadge } from './ChangelogBadge';
import { GamesSection } from './GamesSection';
import { HeroTileWalker } from './HeroTileWalker';

export const HomePage = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;

    document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  return (
    <>
      <Hero />
      <GamesSection />
      <Footer />
    </>
  );
};

const headlineLines = ['Pokémon,', 'mapped to', 'the tile'];
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

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
    <section className="relative isolate overflow-hidden border-b">
      <Container
        ref={containerRef}
        className="relative grid gap-x-12 gap-y-10 pt-10 pb-10 sm:pt-16 sm:pb-14 lg:grid-cols-12 lg:pb-16"
      >
        <h1 className="font-heading text-[clamp(3.5rem,13vw,6rem)] leading-[0.88] font-bold tracking-[-0.055em] lg:col-span-7 lg:self-center lg:text-[clamp(4.5rem,8.4vw,7.5rem)]">
          {headlineLines.map((line, index) => (
            <span
              key={line}
              className="-my-[0.06em] block overflow-hidden py-[0.06em]"
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
          className="h-44 lg:col-span-5 lg:aspect-[10/9] lg:h-auto lg:self-center"
        />
        <div className="relative col-span-full flex flex-wrap items-end justify-between gap-6 pt-6">
          <m.span
            aria-hidden
            className="absolute inset-x-0 top-0 h-px origin-left bg-border"
            initial={reducedMotion ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.6, ease: EASE_OUT_EXPO }}
          />
          <m.p
            className="max-w-[46ch] text-base text-pretty text-muted-foreground sm:text-lg"
            {...reveal(0.9, 16)}
          >
            An interactive atlas of the main games. Wild encounters, trainers
            and items, pinned to their exact spot in every town, route and cave.
          </m.p>
          <m.div {...reveal(1.05, 16)}>
            <ChangelogBadge />
          </m.div>
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
      <Container className="flex flex-wrap items-start justify-between gap-6 pt-8 pb-10 text-[13px] leading-5 text-muted-foreground">
        <Logo className="text-foreground" iconClassName="size-6" />
        <div className="flex max-w-160 flex-col gap-1.5">
          <p className="text-pretty">
            This is a fan project. It isn&apos;t affiliated with Nintendo, Game
            Freak, Creatures Inc. or The Pokémon Company, who own Pokémon and
            everything related to it.
          </p>
          <p className="text-pretty">
            The maps and cursor sprites come from{' '}
            <FooterLink href="https://www.vgmaps.com/">VGMaps</FooterLink> and{' '}
            <FooterLink href="https://www.spriters-resource.com/">
              The Spriters Resource
            </FooterLink>
            , and the box art from{' '}
            <FooterLink href={coverSources.libretro.url}>
              {coverSources.libretro.name}
            </FooterLink>{' '}
            and{' '}
            <FooterLink href={coverSources.thegamesdb.url}>
              {coverSources.thegamesdb.name}
            </FooterLink>
            . Each map credits the person who ripped it. The Pokémon sprites
            come from{' '}
            <FooterLink href={pokemonSpriteSources.showdown.url}>
              {pokemonSpriteSources.showdown.name}
            </FooterLink>{' '}
            and the{' '}
            <FooterLink href={pokemonSpriteSources.smogon.url}>
              {pokemonSpriteSources.smogon.name}
            </FooterLink>
            .
          </p>
        </div>
      </Container>
    </footer>
  );
};

const FooterLink = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => {
  return (
    <a
      href={href}
      className="text-foreground underline underline-offset-3"
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
};
