import { useEffect, useMemo, useState } from 'react';

import { Map as MapIcon, Info } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

import { MapViewer } from '@/components/map/MapViewer';
import { PageTransition } from '@/components/PageTransition';
import { itemsFor } from '@/data/items';
import { inGame, locationInGame, type WildArea } from '@/data/maps';
import { npcsFor } from '@/data/npcs';
import { pokedexFor } from '@/data/pokedex';
import { signsFor } from '@/data/signs';
import { staticPokemonFor } from '@/data/static-pokemon';
import { trainersFor } from '@/data/trainers';
import { useGameRoute } from '@/hooks/useGameRoute';
import { useMapLayout } from '@/hooks/useMapLayout';
import { trailPath } from '@/lib/paths';
import { cn } from '@/lib/utils';
import { NotFoundPage } from '@/pages/NotFound/NotFoundPage';

import { BackLink } from '../BackLink';
import { AsideCard, GameAside } from '../GameAside';
import { useMapFrame } from '../mapFrame';
import { Pokedex } from '../Pokedex/Pokedex';
import { usePokedexLink } from '../Pokedex/usePokedex';
import { encounterGroups, wildAreaFor } from './encounters';
import { EncountersTab, OpenPokedexButton } from './EncountersTab';
import { EventPicker } from './EventPicker';
import { FloorPicker } from './FloorPicker';
import { openableNames } from './links/signs';
import { locationLinks } from './locationLinks';
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
  const immersive =
    useMapLayout(route?.region.versionGroup ?? '') === 'immersive';
  const mapFrame = useMapFrame(route?.region.versionGroup ?? '');

  const trail = route?.trail;
  const location = trail?.at(-1);
  const { floor, arrivedAt, from, selectFloor } = useFloor(location?.floors);
  const { key: visitKey, state: navState } = useLocation();
  const [focusShown, setFocusShown] = useState<string>();
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

  useEffect(() => {
    if (!arrivedAt) return;

    const timer = setTimeout(
      () => setArrivalShown(visitKey),
      ARRIVAL_HIGHLIGHT_MS,
    );

    return () => clearTimeout(timer);
  }, [arrivedAt, visitKey]);

  const arrival = arrivalShown === visitKey ? undefined : arrivedAt;

  const requestedFocus = (navState as { focusKey?: string } | null)?.focusKey;
  const focusKey = focusShown === visitKey ? undefined : requestedFocus;
  const focusRequest = useMemo(
    () => (focusKey ? { key: focusKey, initial: true } : undefined),
    [focusKey],
  );

  useEffect(() => {
    if (!requestedFocus) return;

    const timer = setTimeout(
      () => setFocusShown(visitKey),
      ARRIVAL_HIGHLIGHT_MS,
    );

    return () => clearTimeout(timer);
  }, [requestedFocus, visitKey]);

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
      (area) =>
        area.path === dataPath &&
        area.floor === floor?.id &&
        inGame(area, route.game.id),
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
    locationInGame(location, route.game.id),
    trailPath(trail),
    route.href,
    route.game.tileSize,
    floor,
    {
      from,
      items: itemsFor(route.region.versionGroup)?.filter(onThisMap),
      itemTooltip: (item) => (
        <MapTextTooltip
          text={item.hidden ? `${item.item} (hidden)` : item.item}
          presence={item.note}
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

  const pickers = ((location.floors && floor) || event) && (
    <>
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
    </>
  );
  const cards = (
    <>
      <AsideCard icon={MapIcon} label="Town Map">
        <TownMapCard
          region={route.region}
          path={trailPath(trail)}
          href={route.href}
          collapsible={!immersive}
        />
      </AsideCard>
      <AsideCard icon={Info} label="Location info" grow>
        <LocationPanel tabs={panelTabs} className="min-h-0 flex-1" />
      </AsideCard>
    </>
  );
  const viewer = (
    <MapViewer
      map={mapImage}
      links={links.filter((link) => !hiddenLayers.has(link.layer))}
      highlightable={links}
      highlighted={
        (highlight.scope === scope ? highlight.key : undefined) ??
        focusKey ??
        arrival
      }
      focusKey={requestedFocus ?? arrivedAt}
      pinRequest={
        focusRequest ?? (pinRequest?.scope === scope ? pinRequest : undefined)
      }
      zoomPosition={immersive ? 'bottomleft' : undefined}
      className="size-full"
    />
  );

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
              'absolute inset-0 flex flex-col overflow-hidden',
              !immersive && 'rounded-[14px] border',
            )}
          >
            <PageTransition mapMotion>
              <div className="relative flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1">{viewer}</div>
                {pickers && (
                  <div
                    className={cn(
                      'pointer-events-none absolute z-10 flex flex-col gap-2',
                      immersive
                        ? 'inset-x-14 bottom-4 items-center'
                        : 'top-3 right-3 left-14 items-end',
                    )}
                  >
                    {pickers}
                  </div>
                )}
              </div>
            </PageTransition>
          </div>
        </div>
        {!immersive && (
          <BackLink
            game={route.game}
            trail={trail}
            href={route.href}
            fullWidth
          />
        )}
        <GameAside immersive={immersive}>{cards}</GameAside>
      </div>
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
          href={route.href}
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
      <Pokedex game={route.game} region={route.region} href={route.href} />
    </>
  );
};
