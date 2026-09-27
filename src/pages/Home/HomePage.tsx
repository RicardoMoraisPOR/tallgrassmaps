import { type ReactNode, useEffect } from 'react';

import { useLocation } from 'react-router';

import { Container } from '@/components/Container';
import { Logo } from '@/components/Logo';
import { coverSources } from '@/data/covers';
import { kantoRby } from '@/data/maps/kanto-rby';
import { pokemonSpriteSources } from '@/data/sprites';

import { ChangelogBadge } from './ChangelogBadge';
import { GamesSection } from './GamesSection';
import { HeroTownMap } from './HeroTownMap';

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

const Hero = () => {
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
          <h1 className="font-heading text-[38px] leading-[1.02] font-bold tracking-[-0.04em] text-balance sm:text-6xl sm:leading-[1.02]">
            Every Pokémon map, <span className="text-brand">in one place.</span>
          </h1>
          <p className="max-w-[52ch] text-lg text-pretty text-muted-foreground">
            Tall Grass Maps is an atlas for the Pokémon games. Pick a game and
            you start on its own Town Map. From there, every town and route
            opens the actual map from the game, and the caves and buildings
            inside them open too.
          </p>
          <ChangelogBadge />
        </div>
        <HeroTownMap region={kantoRby} focus="lavender-town" />
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
