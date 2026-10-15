import { lazy, Suspense } from 'react';

import { PageSkeleton } from '@/components/PageSkeleton';
import { useGameRoute } from '@/hooks/useGameRoute';

import { RegionPage } from './Region/RegionPage';

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

  if (!route) return null;

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
