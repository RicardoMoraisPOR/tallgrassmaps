import { useEffect } from 'react';

import { useLocation } from 'react-router';

import { Container } from '@/components/Container';
import { PageTitle } from '@/components/PageTitle';

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
        <PageTitle>Explore maps</PageTitle>
        <p className="max-w-[56ch] text-lg text-pretty text-muted-foreground">
          Every Town Map in the series. Pick your version and start exploring.
        </p>
      </Container>
      <GamesSection />
    </>
  );
};
