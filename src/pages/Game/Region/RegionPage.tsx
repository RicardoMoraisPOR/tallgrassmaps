import { useEffect } from 'react';

import { RegionMap } from '@/components/map/RegionMap';
import { useGameRoute } from '@/hooks/useGameRoute';

import { collectPlaces } from '../places';
import { PokedexOverlay } from '../Pokedex/PokedexOverlay';
import { SidebarLayout } from '../SidebarLayout';
import { MapLegend } from './MapLegend';
import { PlaceList } from './PlaceList';
import { PokedexCard } from './PokedexCard';

export const RegionPage = () => {
  const route = useGameRoute();

  useEffect(() => {
    void import('@/pages/Game/Location/LocationPage');
  }, []);

  if (!route) return null;

  const { game, region, href } = route;

  return (
    <>
      <SidebarLayout
        fitAsideToMain
        aside={
          <>
            <PokedexCard game={game} region={region} />
            <PlaceList
              places={collectPlaces(region)}
              href={href}
              className="lg:min-h-0 lg:flex-1"
            />
            <MapLegend />
          </>
        }
      >
        <div className="flex min-w-0 flex-col gap-3">
          <RegionMap
            region={region}
            locationHref={href}
            tagLabel
            style={{
              maxWidth: `calc((100svh - 13rem) * ${region.width} / ${region.height})`,
            }}
          />
        </div>
      </SidebarLayout>
      <PokedexOverlay game={game} region={region} href={href} />
    </>
  );
};
