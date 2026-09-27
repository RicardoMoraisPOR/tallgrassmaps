import { useState } from 'react';

import { MapViewer } from '@/components/map/MapViewer';
import { itemsFor } from '@/data/items';
import { pokedexFor } from '@/data/pokedex';
import { trainersFor } from '@/data/trainers';
import { useGameRoute } from '@/hooks/useGameRoute';
import { trailPath } from '@/lib/paths';
import { NotFoundPage } from '@/pages/NotFound/NotFoundPage';

import { PokedexOverlay } from '../Pokedex/PokedexOverlay';
import { SidebarLayout } from '../SidebarLayout';
import { EncountersCard } from './EncountersCard';
import { EventPicker } from './EventPicker';
import { FloorPicker } from './FloorPicker';
import { locationLinks } from './locationLinks';
import { MapInfoCard } from './MapInfoCard';
import { defaultHiddenLayers, type MapLayerId, mapLayers } from './mapLayers';
import { TrainersCard } from './TrainersCard';
import { useEventState } from './useEventState';
import { useFloor } from './useFloor';

export const LocationPage = () => {
  const route = useGameRoute();
  const [hiddenLayers, setHiddenLayers] = useState(defaultHiddenLayers);

  const trail = route?.trail;
  const location = trail?.at(-1);
  const { floor, selectFloor } = useFloor(location?.floors);
  const { state: eventState, selectState: selectEventState } = useEventState();

  if (!route || !trail || !location) {
    return <NotFoundPage />;
  }

  const pokedex = pokedexFor(route.region.versionGroup);
  const trainers = trainersFor(route.region.versionGroup);
  const { links, connections, entrances } = locationLinks(
    route.region,
    location,
    trailPath(trail),
    route.href,
    route.game.tileSize,
    floor,
    itemsFor(route.region.versionGroup)?.filter(
      (item) =>
        item.path === trailPath(trail) &&
        item.floor === floor?.id &&
        item.games.includes(route.game.id),
    ),
  );

  const baseImage = floor ?? location;
  const event = baseImage.event;
  const imageSource = event && eventState === 'after' ? event : baseImage;
  const variant = imageSource.variants?.find((entry) =>
    entry.games.includes(route.game.id),
  );
  const mapImage = {
    ...baseImage,
    image: variant?.image ?? imageSource.image,
  };

  const toggleLayer = (layer: MapLayerId) =>
    setHiddenLayers((current) => {
      const next = new Set(current);

      if (!next.delete(layer)) next.add(layer);

      return next;
    });

  return (
    <>
      <SidebarLayout
        aside={
          <>
            <MapInfoCard
              groups={[
                { label: 'Connects to', links: connections },
                { label: 'Entrances', links: entrances },
              ]}
              layers={mapLayers.filter((layer) =>
                links.some((link) => link.layer === layer.id),
              )}
              hiddenLayers={hiddenLayers}
              onToggleLayer={toggleLayer}
            />
            {pokedex && (
              <EncountersCard
                game={route.game}
                path={trailPath(trail)}
                floor={floor?.id}
                pokedex={pokedex}
              />
            )}
            {pokedex && trainers && (
              <TrainersCard
                game={route.game}
                path={trailPath(trail)}
                floor={floor?.id}
                trainers={trainers}
                pokedex={pokedex}
              />
            )}
          </>
        }
      >
        <div className="relative min-w-0">
          <MapViewer
            map={mapImage}
            links={links.filter((link) => !hiddenLayers.has(link.layer))}
            className="h-[60svh] min-w-0 overflow-hidden rounded-[14px] border lg:h-[min(72svh,760px)]"
          />
          {((location.floors && floor) || event) && (
            <div className="pointer-events-none absolute top-3 right-3 left-16 z-10 flex flex-col items-end gap-2">
              {location.floors && floor && (
                <FloorPicker
                  floors={location.floors}
                  selected={floor.id}
                  onSelect={selectFloor}
                />
              )}
              {event && (
                <EventPicker
                  event={event}
                  selected={eventState}
                  onSelect={selectEventState}
                />
              )}
            </div>
          )}
        </div>
      </SidebarLayout>
      <PokedexOverlay
        game={route.game}
        region={route.region}
        href={route.href}
      />
    </>
  );
};
