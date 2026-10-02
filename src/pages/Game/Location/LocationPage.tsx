import { useEffect, useState } from 'react';

import { useLocation, useNavigate, useSearchParams } from 'react-router';

import { MapViewer } from '@/components/map/MapViewer';
import { PageTransition } from '@/components/PageTransition';
import { itemsFor } from '@/data/items';
import type { WildArea } from '@/data/maps';
import { npcsFor } from '@/data/npcs';
import { pokedexFor } from '@/data/pokedex';
import { signsFor } from '@/data/signs';
import { staticPokemonFor } from '@/data/static-pokemon';
import { trainersFor } from '@/data/trainers';
import { useGameRoute } from '@/hooks/useGameRoute';
import { trailPath } from '@/lib/paths';
import { NotFoundPage } from '@/pages/NotFound/NotFoundPage';

import {
  decodeTeam,
  emptyTeam,
  encodeTeam,
  SHARE_PARAM,
  type Team,
} from '../HallOfFame/hallOfFame';
import { HallOfFameDialog } from '../HallOfFame/HallOfFameDialog';
import { Pokedex } from '../Pokedex/Pokedex';
import { usePokedexLink } from '../Pokedex/usePokedex';
import { SidebarLayout } from '../SidebarLayout';
import { encounterGroups, wildAreaFor } from './encounters';
import { EncountersTab, OpenPokedexButton } from './EncountersTab';
import { EventPicker } from './EventPicker';
import { FloorPicker } from './FloorPicker';
import { locationLinks, openableNames } from './locationLinks';
import { EmptyTab, LocationPanel, type PanelTab } from './LocationPanel';
import { MapInfoTab, MapLayerSettingsButton } from './MapInfoTab';
import { useMapLayers } from './mapLayers';
import { MapTextTooltip } from './MapTextTooltip';
import { TownMapCard } from './TownMapCard';
import { TownMapDialog } from './TownMapDialog';
import { TrainerDialog } from './TrainerDialog';
import { battleGroups } from './trainerList';
import { TrainersTab } from './TrainersTab';
import { TrainerTooltip } from './TrainerTooltip';
import { useEventState } from './useEventState';
import { useFloor } from './useFloor';
import { StaticPopup, WildPopup } from './WildPopup';

const ARRIVAL_HIGHLIGHT_MS = 1500;

export const LocationPage = () => {
  const route = useGameRoute();
  const navigate = useNavigate();
  const pokedexLink = usePokedexLink();

  const trail = route?.trail;
  const location = trail?.at(-1);
  const { floor, arrivedAt, selectFloor } = useFloor(location?.floors);
  const { key: visitKey } = useLocation();
  const [arrivalShown, setArrivalShown] = useState<string>();
  const { state: eventState, selectState: selectEventState } = useEventState();
  const scope = trail ? trailPath(trail) : '';
  const dataPath = location?.dataPath ?? scope;
  const hiddenLayers = useMapLayers();
  const [pinRequest, setPinRequest] = useState<{
    scope: string;
    key: string;
  }>();
  const [highlight, setHighlight] = useState<{ scope: string; key?: string }>({
    scope,
  });
  const [selected, setSelected] = useState<{ scope: string; key?: string }>({
    scope,
  });
  const [townMapOpen, setTownMapOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [hallOfFameOpen, setHallOfFameOpen] = useState(() =>
    searchParams.has(SHARE_PARAM),
  );

  useEffect(() => {
    if (!arrivedAt) return;

    const timer = setTimeout(
      () => setArrivalShown(visitKey),
      ARRIVAL_HIGHLIGHT_MS,
    );

    return () => clearTimeout(timer);
  }, [arrivedAt, visitKey]);

  const arrival = arrivalShown === visitKey ? undefined : arrivedAt;

  if (!route || !trail || !location) {
    return <NotFoundPage />;
  }

  const pokedex = pokedexFor(route.region.versionGroup);
  const trainers = trainersFor(route.region.versionGroup);
  const trainerGroups = trainers
    ? battleGroups(trainers, {
        game: route.game,
        path: dataPath,
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
    marker.path === dataPath &&
    marker.floor === floor?.id &&
    marker.games.includes(route.game.id);
  const wildAreas =
    route.region.wildAreas?.filter(
      (area) => area.path === dataPath && area.floor === floor?.id,
    ) ?? [];
  const encounters = pokedex
    ? encounterGroups(pokedex, {
        game: route.game,
        path: dataPath,
        floor: floor?.id,
        hasWater: wildAreas.some((area) => area.method === 'water'),
      })
    : [];
  const wildPopup = (area: WildArea['method'], note?: string) => {
    const groups = encounters.filter(
      ({ method }) => wildAreaFor(method) === area,
    );

    return (
      groups.length > 0 && (
        <WildPopup
          game={route.game}
          path={dataPath}
          groups={groups}
          note={note}
        />
      )
    );
  };

  const { links, layerSections } = locationLinks(
    route.region,
    location,
    trailPath(trail),
    route.href,
    route.game.tileSize,
    floor,
    {
      items: itemsFor(route.region.versionGroup)?.filter(onThisMap),
      itemTooltip: (item) => (
        <MapTextTooltip
          text={item.hidden ? `${item.item} (hidden)` : item.item}
        />
      ),
      trainers: listedBattles,
      onSelectTrainer: selectTrainer,
      npcs: npcsFor(route.region.versionGroup)?.filter(onThisMap),
      npcTooltip: (npc) => (
        <MapTextTooltip
          name={npc.name}
          dialog={npc.dialog}
          game={route.game}
          presence={npc.presence}
        />
      ),
      signs: signsFor(route.region.versionGroup)?.filter(onThisMap),
      signTooltip: (sign) => (
        <MapTextTooltip
          text={sign.opens ? openableNames[sign.opens] : sign.text}
        />
      ),
      onOpen: (target) => {
        if (target === 'pokedex')
          navigate(pokedexLink.to, { state: pokedexLink.state });
        else if (target === 'hall-of-fame') setHallOfFameOpen(true);
        else setTownMapOpen(true);
      },
      trainerTooltip: ([listed, ...others]) =>
        pokedex && (
          <TrainerTooltip
            listed={listed}
            encounters={others.length + 1}
            game={route.game}
            pokedex={pokedex}
          />
        ),
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
  const pokemonCount = new Set(
    encounters.flatMap((group) => group.rows.map((row) => row.entry.number)),
  ).size;
  const panelTabs: Array<PanelTab> = [
    {
      id: 'info',
      label: 'Map info',
      action: <MapLayerSettingsButton />,
      content: (
        <MapInfoTab
          sections={layerSections}
          onHighlight={highlightTo}
          onOpen={(key) => {
            const action = links.find(
              (link) =>
                link.onClick && [link.highlightKey].flat().includes(key),
            )?.onClick;

            if (listedBattles.some((listed) => listed.key === key))
              selectTrainer(key);
            else if (action) action();
            else setPinRequest({ scope, key });
          }}
          hiddenLayers={hiddenLayers}
        />
      ),
    },
    {
      id: 'pokemon',
      label: 'Pokémon',
      count: pokemonCount,
      action: <OpenPokedexButton />,
      content:
        pokedex && pokemonCount > 0 ? (
          <EncountersTab
            game={route.game}
            path={dataPath}
            groups={encounters}
            onHighlight={highlightTo}
          />
        ) : (
          <EmptyTab>No Pokémon to catch here.</EmptyTab>
        ),
    },
    {
      id: 'trainers',
      label: 'Trainers',
      count: listedBattles.length,
      content:
        pokedex && listedBattles.length > 0 ? (
          <TrainersTab
            game={route.game}
            groups={trainerGroups}
            pokedex={pokedex}
            onHighlight={highlightTo}
            onSelect={selectTrainer}
          />
        ) : (
          <EmptyTab>No trainer battles here.</EmptyTab>
        ),
    },
  ];

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
        fitAsideToMain
        aside={
          <>
            <TownMapCard
              region={route.region}
              path={trailPath(trail)}
              href={route.href}
            />
            <LocationPanel tabs={panelTabs} className="lg:flex-1" />
          </>
        }
      >
        <div className="flex min-w-0 flex-col overflow-clip rounded-[14px]">
          <PageTransition mapMotion>
            <div className="relative min-w-0">
              <MapViewer
                map={mapImage}
                links={links.filter((link) => !hiddenLayers.has(link.layer))}
                highlightable={links}
                highlighted={
                  (highlight.scope === scope ? highlight.key : undefined) ??
                  arrival
                }
                focusKey={arrivedAt}
                pinRequest={
                  pinRequest?.scope === scope ? pinRequest : undefined
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
          battles={listedBattles}
          place={location.name}
          game={route.game}
          pokedex={pokedex}
          onSelect={selectTrainer}
          onClose={() => selectTrainer(undefined)}
        />
      )}
      <TownMapDialog
        open={townMapOpen}
        region={route.region}
        path={trailPath(trail)}
        href={route.href}
        onClose={() => setTownMapOpen(false)}
      />
      {pokedex && (
        <HallOfFameDialog
          open={hallOfFameOpen}
          game={route.game}
          pokedex={pokedex}
          team={
            decodeTeam(searchParams.get(SHARE_PARAM), pokedex) ?? emptyTeam()
          }
          onTeamChange={(team: Team) =>
            setSearchParams(
              (current) => {
                const next = new URLSearchParams(current);

                if (team.some(Boolean)) next.set(SHARE_PARAM, encodeTeam(team));
                else next.delete(SHARE_PARAM);

                return next;
              },
              { replace: true, preventScrollReset: true },
            )
          }
          onClose={() => setHallOfFameOpen(false)}
        />
      )}
      <Pokedex game={route.game} region={route.region} href={route.href} />
    </>
  );
};
