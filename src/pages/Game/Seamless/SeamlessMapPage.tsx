import { Gamepad2 } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useNavigate } from 'react-router';

import { SeamlessMap } from '@/components/map/SeamlessMap';
import { useGameRoute } from '@/hooks/useGameRoute';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { DESKTOP_QUERY } from '@/lib/breakpoints';
import { easeOutSoft } from '@/lib/motion';
import { NotFoundPage } from '@/pages/NotFound/NotFoundPage';

import { AsideCard, GameAside } from '../GameAside';
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
  const desktop = useMediaQuery(DESKTOP_QUERY);

  if (!route?.trail) return <NotFoundPage />;

  const { game, region, href, trail } = route;
  const zone = trail[0];

  return (
    <>
      <div className="relative h-[max(30rem,calc(100svh-3.5rem-1px))] overflow-x-clip">
        <div className="absolute inset-x-0 -top-[57px] bottom-0">
          <div className="absolute inset-0 overflow-hidden">
            <SeamlessMap
              region={region}
              selected={zone?.id}
              onSelect={(target) => navigate(href(target))}
              rightInset={desktop ? ASIDE_INSET : 0}
              zoomPosition="bottomleft"
              className="size-full"
            />
          </div>
        </div>
        <GameAside>
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
