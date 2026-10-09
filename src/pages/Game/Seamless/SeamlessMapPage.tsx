import { Gamepad2 } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useNavigate } from 'react-router';

import { SeamlessMap } from '@/components/map/SeamlessMap';
import { useGameRoute } from '@/hooks/useGameRoute';
import { useMapLayout } from '@/hooks/useMapLayout';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { DESKTOP_QUERY } from '@/lib/breakpoints';
import { easeOutSoft } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { NotFoundPage } from '@/pages/NotFound/NotFoundPage';

import { BackLink } from '../BackLink';
import { AsideCard, GameAside } from '../GameAside';
import { useMapFrame } from '../mapFrame';
import { Pokedex } from '../Pokedex/Pokedex';
import { GameInfoCard } from '../Region/GameInfoCard';
import { ZonePanel } from './ZonePanel';

const ASIDE_INSET = 392;

const OFFSCREEN = { x: '115%', opacity: 0 };
const ENTER = { duration: 0.35, ease: easeOutSoft };
const EXIT = { duration: 0.25, ease: easeOutSoft };

export const SeamlessMapPage = () => {
  const route = useGameRoute();
  const navigate = useNavigate();
  const immersive =
    useMapLayout(route?.region.versionGroup ?? '') === 'immersive';
  const mapFrame = useMapFrame(route?.region.versionGroup ?? '');
  const desktop = useMediaQuery(DESKTOP_QUERY);

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
            {...mapFrame}
            className={cn(
              'absolute inset-0 overflow-hidden',
              !immersive && 'rounded-[14px] border',
            )}
          >
            <SeamlessMap
              region={region}
              selected={zone?.id}
              onSelect={(target) => navigate(href(target))}
              rightInset={immersive && desktop ? ASIDE_INSET : 0}
              zoomPosition={immersive ? 'bottomleft' : undefined}
              className="size-full"
            />
          </div>
        </div>
        {!immersive && (
          <BackLink game={game} trail={route.trail} href={href} fullWidth />
        )}
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
                />
              ) : (
                <>
                  <AsideCard icon={Gamepad2} label="Game info" grow>
                    <GameInfoCard game={game} region={region} />
                  </AsideCard>
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
