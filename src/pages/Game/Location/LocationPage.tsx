import { MapViewer } from '@/components/map/MapViewer';
import { pokedexFor } from '@/data/pokedex';
import { trainersFor } from '@/data/trainers';
import { useGameRoute } from '@/hooks/useGameRoute';
import { trailPath } from '@/lib/paths';
import { NotFoundPage } from '@/pages/NotFound/NotFoundPage';

import { SidebarLayout } from '../SidebarLayout';
import { EncountersCard } from './EncountersCard';
import { locationLinks } from './locationLinks';
import { PlaceCard } from './PlaceCard';
import { TrainersCard } from './TrainersCard';

export const LocationPage = () => {
  const route = useGameRoute();

  const trail = route?.trail;
  const location = trail?.at(-1);

  if (!route || !trail || !location) {
    return <NotFoundPage />;
  }

  const pokedex = pokedexFor(route.region.versionGroup);
  const trainers = trainersFor(route.region.versionGroup);
  const { links, inside, connections } = locationLinks(
    route.region,
    location,
    trailPath(trail),
    route.href,
  );

  return (
    <SidebarLayout
      aside={
        <>
          <PlaceCard
            kind={location.kind}
            groups={[
              { label: 'Inside', links: inside },
              { label: 'Connects to', links: connections },
            ]}
          />
          {pokedex && (
            <EncountersCard
              game={route.game}
              path={trailPath(trail)}
              pokedex={pokedex}
            />
          )}
          {pokedex && trainers && (
            <TrainersCard
              game={route.game}
              path={trailPath(trail)}
              trainers={trainers}
              pokedex={pokedex}
            />
          )}
        </>
      }
    >
      <MapViewer
        map={location}
        links={links}
        className="h-[60svh] min-w-0 overflow-hidden rounded-[14px] border lg:h-[min(72svh,760px)]"
      />
    </SidebarLayout>
  );
};
