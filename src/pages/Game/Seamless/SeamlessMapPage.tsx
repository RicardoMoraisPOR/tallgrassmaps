import { useSyncExternalStore } from 'react';

import { AnimatePresence, m } from 'motion/react';
import { useNavigate } from 'react-router';

import { SeamlessMap } from '@/components/map/SeamlessMap';
import { useGameRoute } from '@/hooks/useGameRoute';
import { easeOutSoft } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { NotFoundPage } from '@/pages/NotFound/NotFoundPage';
import { useMapLayout } from '@/stores/settings';

import { GameAside } from '../GameAside';
import { mapFrameProps, useMapFrame } from '../mapFrame';
import { collectPlaces, placeGroupsFor } from '../places';
import { Pokedex } from '../Pokedex/Pokedex';
import { MapLegend } from '../Region/MapLegend';
import { PlaceList } from '../Region/PlaceList';
import { PokedexCard } from '../Region/PokedexCard';
import { ZonePanel } from './ZonePanel';

const ASIDE_INSET = 392;
const DESKTOP_QUERY = '(min-width: 1024px)';

const useDesktop = () =>
  useSyncExternalStore(
    (notify) => {
      const query = matchMedia(DESKTOP_QUERY);

      query.addEventListener('change', notify);

      return () => query.removeEventListener('change', notify);
    },
    () => matchMedia(DESKTOP_QUERY).matches,
    () => true,
  );
const OFFSCREEN = { x: '115%', opacity: 0 };
const ENTER = { duration: 0.35, ease: easeOutSoft };
const EXIT = { duration: 0.25, ease: easeOutSoft };

export const SeamlessMapPage = () => {
  const route = useGameRoute();
  const navigate = useNavigate();
  const immersive =
    useMapLayout(route?.region.versionGroup ?? '') === 'immersive';
  const mapFrame = useMapFrame(String(immersive));
  const desktop = useDesktop();

  if (!route?.trail) return <NotFoundPage />;

  const { game, region, href, trail } = route;
  const zone = trail[0];

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
          className={cn(
            immersive
              ? 'absolute inset-0'
              : 'relative h-[60svh] min-w-0 lg:h-[min(72svh,760px)]',
          )}
        >
          <div
            ref={mapFrame}
            {...mapFrameProps}
            className={cn(
              'absolute inset-0 overflow-hidden',
              !immersive && 'rounded-[14px] border',
            )}
          >
            <SeamlessMap
              region={region}
              selected={zone?.id}
              onSelect={(target) => navigate(href(target))}
              onLeave={() => navigate(href(''))}
              rightInset={immersive && desktop ? ASIDE_INSET : 0}
              zoomPosition={immersive ? 'bottomleft' : undefined}
              className="size-full"
            />
          </div>
        </div>
        <GameAside immersive={immersive}>
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={zone ? 'zone' : 'overview'}
              initial={OFFSCREEN}
              animate={{ x: 0, opacity: 1, transition: ENTER }}
              exit={{ ...OFFSCREEN, transition: EXIT }}
              className="flex min-h-0 flex-1 flex-col gap-3"
            >
              {zone ? (
                <ZonePanel
                  key={zone.id}
                  game={game}
                  region={region}
                  zone={zone}
                  href={href}
                  immersive={immersive}
                />
              ) : (
                <>
                  <PokedexCard game={game} region={region} />
                  <PlaceList
                    places={collectPlaces(region, game.id)}
                    placeGroups={placeGroupsFor(region)}
                    href={href}
                    className={
                      immersive ? 'min-h-48 flex-1' : 'lg:min-h-0 lg:flex-1'
                    }
                  />
                  <MapLegend placeGroups={placeGroupsFor(region)} />
                </>
              )}
            </m.div>
          </AnimatePresence>
        </GameAside>
      </div>
      <Pokedex game={game} region={region} href={href} />
    </>
  );
};
