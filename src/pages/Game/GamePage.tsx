import { lazy, Suspense, useEffect } from 'react';

import { Navigate, useLocation } from 'react-router';

import { PageSkeleton } from '@/components/PageSkeleton';
import { regionHref } from '@/data/maps';
import { useGameRoute } from '@/hooks/useGameRoute';
import { trailPath } from '@/lib/paths';
import { useRecentPlacesStore } from '@/stores/recentPlaces';

import { HubPage } from './Hub/HubPage';
import { RegionPage } from './Region/RegionPage';
import { WorldMapPage } from './Region/WorldMapPage';

const LocationPage = lazy(() =>
  import('./Location/LocationPage').then((module) => ({
    default: module.LocationPage,
  })),
);

const SeamlessMapPage = lazy(() =>
  import('./Seamless/SeamlessMapPage').then((module) => ({
    default: module.SeamlessMapPage,
  })),
);

export const GamePage = () => {
  const route = useGameRoute();
  const { search } = useLocation();
  const visit = useRecentPlacesStore((state) => state.visit);
  const gameId = route?.game.id;
  const visitedPath = route?.trail?.length ? trailPath(route.trail) : undefined;

  useEffect(() => {
    if (gameId && visitedPath) visit(gameId, visitedPath);
  }, [gameId, visitedPath, visit]);

  if (!route) return null;

  if (route.legacyPath)
    return (
      <Navigate
        to={`${regionHref(route.game.id, route.region, route.legacyPath)}${search}`}
        replace
      />
    );

  if (route.hub) return <HubPage route={route} />;

  if (route.worldShown) return <WorldMapPage route={route} />;

  if (route.region.navigation === 'seamless') {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <SeamlessMapPage />
      </Suspense>
    );
  }

  if (route.trail?.length === 0) return <RegionPage />;

  return (
    <Suspense fallback={<PageSkeleton />}>
      <LocationPage />
    </Suspense>
  );
};
