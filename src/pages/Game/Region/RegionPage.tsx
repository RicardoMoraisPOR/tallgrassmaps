import { useEffect } from 'react';

import RegionMap from '@/components/map/RegionMap';
import { useGameRoute } from '@/hooks/useGameRoute';

import { collectPlaces } from '../places';
import SidebarLayout from '../SidebarLayout';
import MapLegend, { MapCredits } from './MapLegend';
import PlaceList from './PlaceList';

export default function RegionPage() {
  const route = useGameRoute();

  useEffect(() => {
    void import('@/pages/Game/Location/LocationPage');
  }, []);

  if (!route) return null;

  const { region, href } = route;

  return (
    <SidebarLayout
      aside={
        <>
          <PlaceList places={collectPlaces(region)} href={href} />
          <MapLegend />
        </>
      }
    >
      <div className="flex min-w-0 flex-col gap-3">
        <RegionMap
          region={region}
          locationHref={href}
          style={{
            maxWidth: `calc((100svh - 13rem) * ${region.width} / ${region.height})`,
          }}
        />
        <MapCredits region={region} />
      </div>
    </SidebarLayout>
  );
}
