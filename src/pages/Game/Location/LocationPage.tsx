import { useState } from 'react';

import { MapViewer } from '@/components/map/MapViewer';
import { PageTransition } from '@/components/PageTransition';
import { itemsFor } from '@/data/items';
import type { WildArea } from '@/data/maps';
import { pokedexFor } from '@/data/pokedex';
import { staticPokemonFor } from '@/data/static-pokemon';
import { trainersFor } from '@/data/trainers';
import { useGameRoute } from '@/hooks/useGameRoute';
import { trailPath } from '@/lib/paths';
import { NotFoundPage } from '@/pages/NotFound/NotFoundPage';

import { PokedexOverlay } from '../Pokedex/PokedexOverlay';
import { SidebarLayout } from '../SidebarLayout';
import { encounterGroups, wildAreaFor } from './encounters';
import { EncountersCard } from './EncountersCard';
import { EventPicker } from './EventPicker';
import { FloorPicker } from './FloorPicker';
import { locationLinks } from './locationLinks';
import { MapInfoCard } from './MapInfoCard';
import { mapLayers, useMapLayers } from './mapLayers';
import { TownMapCard } from './TownMapCard';
import { TrainerDialog } from './TrainerDialog';
import { battleGroups } from './trainerList';
import { TrainersCard } from './TrainersCard';
import { useEventState } from './useEventState';
import { useFloor } from './useFloor';
import { StaticPopup, WildPopup } from './WildPopup';

export const LocationPage = () => {
  const route = useGameRoute();

  const trail = route?.trail;
  const location = trail?.at(-1);
  const { floor, selectFloor } = useFloor(location?.floors);
  const { state: eventState, selectState: selectEventState } = useEventState();
  const scope = trail ? trailPath(trail) : '';
  const layerState = useMapLayers(scope);
  const [highlight, setHighlight] = useState<{ scope: string; key?: string }>({
    scope,
  });
  const [selected, setSelected] = useState<{ scope: string; key?: string }>({
    scope,
  });

  if (!route || !trail || !location) {
    return <NotFoundPage />;
  }

  const pokedex = pokedexFor(route.region.versionGroup);
  const trainers = trainersFor(route.region.versionGroup);
  const trainerGroups = trainers
    ? battleGroups(trainers, {
        game: route.game,
        path: trailPath(trail),
        floor: floor?.id,
        onMapOnly: location.kind === 'town',
      })
    : [];
  const listedBattles = trainerGroups.flatMap((group) => group.battles);
  const selectTrainer = (key: string | undefined) =>
    setSelected({ scope, key });
  const onThisMap = (marker: {
    path: string;
    floor?: string;
    games: Array<string>;
  }) =>
    marker.path === trailPath(trail) &&
    marker.floor === floor?.id &&
    marker.games.includes(route.game.id);
  const wildAreas =
    route.region.wildAreas?.filter(
      (area) => area.path === trailPath(trail) && area.floor === floor?.id,
    ) ?? [];
  const encounters = pokedex
    ? encounterGroups(pokedex, {
        game: route.game,
        path: trailPath(trail),
        floor: floor?.id,
        hasWater: wildAreas.some((area) => area.method === 'water'),
      })
    : [];
  const wildPopup = (area: WildArea['method']) => {
    const groups = encounters.filter(
      ({ method }) => wildAreaFor(method) === area,
    );

    return (
      groups.length > 0 && (
        <WildPopup game={route.game} path={trailPath(trail)} groups={groups} />
      )
    );
  };

  const { links, connections, entrances } = locationLinks(
    route.region,
    location,
    trailPath(trail),
    route.href,
    route.game.tileSize,
    floor,
    {
      items: itemsFor(route.region.versionGroup)?.filter(onThisMap),
      trainers: listedBattles,
      onSelectTrainer: selectTrainer,
      wildAreas,
      wildPopup,
      staticPokemon: staticPokemonFor(route.region.versionGroup)?.filter(
        onThisMap,
      ),
      staticPopup: (marker) =>
        pokedex && (
          <StaticPopup game={route.game} marker={marker} pokedex={pokedex} />
        ),
    },
  );
  const highlightTo = (key: string | undefined) => setHighlight({ scope, key });

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
              hiddenLayers={layerState.hiddenLayers}
              onToggleLayer={layerState.toggle}
              onLayerSettingChange={layerState.reset}
              onHighlight={highlightTo}
            />
            <TownMapCard
              region={route.region}
              path={trailPath(trail)}
              name={location.name}
            />
            {pokedex && (
              <EncountersCard
                game={route.game}
                path={trailPath(trail)}
                groups={encounters}
                onHighlight={highlightTo}
              />
            )}
            {pokedex && (
              <TrainersCard
                game={route.game}
                groups={trainerGroups}
                pokedex={pokedex}
                onHighlight={highlightTo}
                onSelect={selectTrainer}
              />
            )}
          </>
        }
      >
        <div className="flex min-w-0 flex-col overflow-clip rounded-[14px]">
          <PageTransition mapMotion>
            <div className="relative min-w-0">
              <MapViewer
                map={mapImage}
                links={links.filter(
                  (link) => !layerState.hiddenLayers.has(link.layer),
                )}
                highlightable={links}
                highlighted={
                  highlight.scope === scope ? highlight.key : undefined
                }
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
          </PageTransition>
        </div>
      </SidebarLayout>
      {pokedex && (
        <TrainerDialog
          listed={
            selected.scope === scope
              ? listedBattles.find((listed) => listed.key === selected.key)
              : undefined
          }
          place={location.name}
          game={route.game}
          pokedex={pokedex}
          onClose={() => selectTrainer(undefined)}
        />
      )}
      <PokedexOverlay
        game={route.game}
        region={route.region}
        href={route.href}
      />
    </>
  );
};
