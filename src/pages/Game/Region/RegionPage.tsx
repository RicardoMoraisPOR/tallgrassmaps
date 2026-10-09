import { useEffect } from 'react';

import { RegionMap } from '@/components/map/RegionMap';
import { useGameRoute } from '@/hooks/useGameRoute';
import { useMapLayout } from '@/hooks/useMapLayout';
import { cn } from '@/lib/utils';

import { GameAside } from '../GameAside';
import { useMapFrame } from '../mapFrame';
import { collectPlaces, placeGroupsFor } from '../places';
import { Pokedex } from '../Pokedex/Pokedex';
import { MapLegend } from './MapLegend';
import { PlaceList } from './PlaceList';
import { PokedexCard } from './PokedexCard';

const IMMERSIVE_MAP_SHARE = 0.8;
const MINIMALIST_MAP_HEIGHT = '(100svh - 13rem)';

export const RegionPage = () => {
  const route = useGameRoute();
  const immersive =
    useMapLayout(route?.region.versionGroup ?? '') === 'immersive';
  const mapFrame = useMapFrame(route?.region.versionGroup ?? '');

  useEffect(() => {
    void import('@/pages/Game/Location/LocationPage');
  }, []);

  if (!route) return null;

  const { game, region, href } = route;

  return (
    <>
      <div
        className={cn(
          immersive
            ? 'relative h-[max(30rem,calc(100svh-3.5rem-1px))] overflow-hidden'
            : 'grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]',
        )}
      >
        <div
          style={
            immersive
              ? undefined
              : {
                  maxWidth: `calc(${MINIMALIST_MAP_HEIGHT} * ${region.width} / ${region.height})`,
                  aspectRatio: `${region.width} / ${region.height}`,
                }
          }
          className={cn(immersive ? 'absolute inset-0' : 'relative min-w-0')}
        >
          <div
            {...mapFrame}
            className={cn(
              'absolute inset-0 flex items-center justify-center overflow-hidden [container-type:size]',
              immersive && 'bg-muted',
            )}
          >
            <RegionMap
              region={region}
              locationHref={href}
              tagLabel
              className="w-full transition-[max-width] duration-500 ease-out"
              style={{
                maxWidth: `calc(${immersive ? IMMERSIVE_MAP_SHARE : 1} * 100cqh * ${region.width} / ${region.height})`,
              }}
            />
          </div>
        </div>
        <GameAside immersive={immersive}>
          <PokedexCard game={game} region={region} />
          <PlaceList
            places={collectPlaces(region, game.id)}
            placeGroups={placeGroupsFor(region)}
            href={href}
            className={immersive ? 'min-h-48 flex-1' : 'lg:min-h-0 lg:flex-1'}
          />
          <MapLegend placeGroups={placeGroupsFor(region)} />
        </GameAside>
      </div>
      <Pokedex game={game} region={region} href={href} />
    </>
  );
};
