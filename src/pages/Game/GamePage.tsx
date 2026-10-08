import { lazy, Suspense } from 'react';

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
      <Suspense fallback={null}>
        <SeamlessMapPage />
      </Suspense>
    );
  }

  if (route.trail?.length === 0) return <RegionPage />;

  return (
    <Suspense fallback={null}>
      <LocationPage />
    </Suspense>
  );
};
