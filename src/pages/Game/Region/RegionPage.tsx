import { useEffect } from 'react';

import { Gamepad2 } from 'lucide-react';

import { RegionMap } from '@/components/map/RegionMap';
import { useGameRoute } from '@/hooks/useGameRoute';

import { AsideCard, GameAside } from '../GameAside';
import { Pokedex } from '../Pokedex/Pokedex';
import { GameInfoCard } from './GameInfoCard';

const MAP_SHARE = 0.8;

export const RegionPage = () => {
  const route = useGameRoute();

  useEffect(() => {
    void import('@/pages/Game/Location/LocationPage');
  }, []);

  if (!route) return null;

  const { game, region, href } = route;

  return (
    <>
      <div className="relative h-[max(30rem,calc(100svh-3.5rem-1px))] overflow-x-clip">
        <div className="absolute inset-x-0 -top-[57px] bottom-0">
          <div className="[container-type:size] absolute inset-0 flex items-center justify-center overflow-hidden bg-muted">
            <RegionMap
              region={region}
              locationHref={href}
              tagLabel
              className="w-full"
              style={{
                maxWidth: `calc(${MAP_SHARE} * 100cqh * ${region.width} / ${region.height})`,
              }}
            />
          </div>
        </div>
        <GameAside>
          <AsideCard icon={Gamepad2} label="Game info" grow>
            <GameInfoCard game={game} region={region} />
          </AsideCard>
        </GameAside>
      </div>
      <Pokedex game={game} region={region} href={href} />
    </>
  );
};
