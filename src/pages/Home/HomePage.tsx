import { type ReactNode, useEffect } from 'react';

import { ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router';

import Container from '@/components/Container';
import Logo from '@/components/Logo';
import { generations } from '@/data/catalog';
import { coverSources } from '@/data/covers';
import { kantoRby } from '@/data/maps/kanto-rby';
import { generationId } from '@/lib/paths';

import GameCard from './GameCard';
import HeroTownMap from './HeroTownMap';

export default function HomePage() {
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
}

function Hero() {
  return (
    <section className="relative isolate">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage:
            'radial-gradient(ellipse 70% 60% at 50% 30%, black 0%, transparent 75%)',
        }}
      />
      <Container className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-center gap-12 pt-10 pb-14 sm:pt-22 sm:pb-26">
        <div className="flex flex-col items-start gap-6">
          <a
            href={`#${generationId(1)}`}
            className="inline-flex min-h-8 items-center gap-2 rounded-full border bg-card py-1 pr-3 pl-1.5 text-[13px] leading-5 transition-colors hover:border-ring"
          >
            <span className="inline-flex h-5.5 items-center rounded-full bg-[oklch(0.39_0.08_150)] px-2 text-xs font-semibold text-[oklch(0.9_0.1_145)]">
              New
            </span>
            Kanto is up: Red, Blue and Yellow
            <ChevronRight className="size-3.5 text-muted-foreground" />
          </a>
          <h1 className="font-heading text-[38px] leading-[1.02] font-bold tracking-[-0.04em] text-balance sm:text-6xl sm:leading-[1.02]">
            Every Pokémon map, <span className="text-brand">in one place.</span>
          </h1>
          <p className="max-w-[52ch] text-lg text-pretty text-muted-foreground">
            Tall Grass Maps is an atlas for the Pokémon games. Pick a game and
            you start on its own Town Map. From there, every town and route
            opens the actual map from the game, and the caves and buildings
            inside them open too.
          </p>
        </div>
        <HeroTownMap region={kantoRby} focus="lavender-town" />
      </Container>
    </section>
  );
}

function GamesSection() {
  return (
    <section
      id="games"
      aria-labelledby="games-heading"
      className="border-t bg-muted/40"
    >
      <Container className="flex flex-col gap-14 py-18">
        <div className="flex flex-col gap-2">
          <h2
            id="games-heading"
            className="font-heading text-[28px] leading-[1.1] font-bold tracking-[-0.03em] sm:text-4xl sm:leading-[1.1]"
          >
            Pick a game
          </h2>
          <p className="max-w-[56ch] text-muted-foreground">
            Only Kanto so far. I&apos;m adding the other regions as I go, oldest
            games first.
          </p>
        </div>
        {generations.map((generation) => (
          <div
            key={generation.number}
            id={generationId(generation.number)}
            className="flex scroll-mt-6 flex-col gap-5"
          >
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-semibold tracking-tight whitespace-nowrap">
                Generation {generation.roman}{' '}
                <span className="font-normal text-muted-foreground">
                  — {generation.region}
                </span>
              </h3>
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-5">
              {generation.entries.map((entry) => (
                <GameCard
                  key={entry.game.id}
                  entry={entry}
                  generation={generation.roman}
                />
              ))}
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}

function Footer() {
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
            The maps and sprites come from{' '}
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
            . Each map credits the person who ripped it.
          </p>
        </div>
      </Container>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
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
}
