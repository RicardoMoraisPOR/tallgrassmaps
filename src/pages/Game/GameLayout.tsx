import { Container } from '@/components/Container';
import { PageTransition } from '@/components/PageTransition';
import { useGameRoute } from '@/hooks/useGameRoute';
import { useMapLayout } from '@/hooks/useMapLayout';
import { pathSegments } from '@/lib/paths';
import { cn } from '@/lib/utils';
import { NotFoundPage } from '@/pages/NotFound/NotFoundPage';

import { LayoutToggle } from './LayoutToggle';
import { PageHeader } from './PageHeader';
import { PlaceSearchButton, PlaceSearchProvider } from './Search/PlaceSearch';

const pageKind = (pathname: string) => {
  const [game, ...place] = pathSegments(pathname);

  return place.length === 0 ? `/${game}` : `/${game}/location`;
};

export const GameLayout = () => {
  const route = useGameRoute();
  const layout = useMapLayout(route?.region.versionGroup ?? '');

  if (!route) {
    return <NotFoundPage />;
  }

  const immersive = layout === 'immersive';

  return (
    <PlaceSearchProvider
      game={route.game}
      region={route.region}
      href={route.href}
    >
      <div className="relative flex flex-1 flex-col">
        <LayoutToggle versionGroup={route.region.versionGroup} />
        {!immersive && <PlaceSearchButton floating />}
        <Container
          as="section"
          className={cn(
            'flex flex-1 flex-col',
            immersive
              ? 'max-w-none px-0'
              : 'gap-7 pt-6 pb-10 sm:pt-10 sm:pb-16',
          )}
        >
          <PageHeader
            floating={immersive}
            game={route.game}
            region={route.region}
            trail={route.trail ?? []}
            href={route.href}
          />
          <div className="flex flex-1 flex-col overflow-clip">
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
