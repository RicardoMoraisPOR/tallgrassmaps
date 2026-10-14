import '@fontsource/barlow/400.css';
import { useEffect } from 'react';

import { useLocation } from 'react-router';

import { Container } from '@/components/Container';

import { GamesSection } from './GamesSection';

export const MapsPage = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;

    document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  return (
    <>
      <Container
        as="section"
        className="flex flex-col gap-2 pt-10 pb-8 sm:pt-14"
      >
        <h1 className="font-heading text-4xl leading-[1.05] font-bold tracking-[-0.035em] sm:text-5xl">
          Explore maps
        </h1>
        <p className="max-w-[56ch] text-lg text-pretty text-muted-foreground">
          Every Town Map in the series. Pick your version and start exploring.
        </p>
      </Container>
      <GamesSection />
    </>
  );
};
