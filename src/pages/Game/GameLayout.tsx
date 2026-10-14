import { Container } from '@/components/Container';
import { PageTransition } from '@/components/PageTransition';
import { useGameRoute } from '@/hooks/useGameRoute';
import { pathSegments } from '@/lib/paths';
import { NotFoundPage } from '@/pages/NotFound/NotFoundPage';

import { PageHeader } from './PageHeader';
import { PlaceSearchProvider } from './Search/PlaceSearch';

const pageKind = (pathname: string) => {
  const [game, ...place] = pathSegments(pathname);

  return place.length === 0 ? `/${game}` : `/${game}/location`;
};

export const GameLayout = () => {
  const route = useGameRoute();

  if (!route) {
    return <NotFoundPage />;
  }

  return (
    <PlaceSearchProvider
      game={route.game}
      region={route.region}
      href={route.href}
    >
      <div className="relative flex flex-1 flex-col">
        <Container
          as="section"
          className="flex max-w-none flex-1 flex-col px-0"
        >
          <PageHeader
            game={route.game}
            region={route.region}
            trail={route.trail ?? []}
            href={route.href}
          />
          <div className="flex flex-1 flex-col overflow-x-clip">
            <PageTransition
              mapMotion
              keyFor={
                route.region.navigation === 'seamless'
                  ? (pathname) => `/${pathSegments(pathname)[0]}`
                  : pageKind
              }
            />
          </div>
        </Container>
      </div>
    </PlaceSearchProvider>
  );
};
