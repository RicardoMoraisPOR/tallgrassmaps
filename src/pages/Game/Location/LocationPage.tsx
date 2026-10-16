import { useCallback, useEffect, useMemo, useState } from 'react';

import { Map as MapIcon, Info } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

import { MapViewer } from '@/components/map/MapViewer';
import { PageTransition } from '@/components/PageTransition';
import type { LocationFloor } from '@/data/maps';
import type { Shop } from '@/data/shops/types';
import { useGameRoute } from '@/hooks/useGameRoute';
import { trailPath } from '@/lib/paths';
import { NotFoundPage } from '@/pages/NotFound/NotFoundPage';
import { useSettingsStore } from '@/stores/settings';

import { AsideCard, GameAside } from '../GameAside';
import { Pokedex } from '../Pokedex/Pokedex';
import { usePokedexLink } from '../Pokedex/usePokedex';
import { WorldSwitch } from '../Region/WorldToggle';
import { EventPicker } from './EventPicker';
import { FloorPicker } from './FloorPicker';
import { LocationPanel } from './LocationPanel';
import { locationPanelTabs } from './locationPanelTabs';
import { buildLocationView } from './locationView';
import { useMapLayers } from './mapLayers';
import { ShopDialog } from './ShopDialog';
import {
  floorLayouts,
  offsetLink,
  stackedHref,
  stackFloors,
} from './stackLayout';
import { TownMapCard } from './TownMapCard';
import { TownMapDialog } from './TownMapDialog';
import { TrainerDialog } from './TrainerDialog';
import { useEventState } from './useEventState';
import { useFloor } from './useFloor';

const ARRIVAL_HIGHLIGHT_MS = 1500;

export const LocationPage = () => {
  const route = useGameRoute();
  const navigate = useNavigate();
  const setWorldPreferred = useSettingsStore((state) => state.setWorldView);
  const pokedexLink = usePokedexLink();

  const trail = route?.trail;
  const location = trail?.at(-1);
  const {
    floor,
    floorRequested,
    arrivedAt,
    from,
    stacked,
    selectFloor,
    setStacked,
  } = useFloor(location?.floors);
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
  const openTownMap = useCallback(() => setTownMapOpen(true), [setTownMapOpen]);
  const [shop, setShop] = useState<{ shops: Array<Shop>; selected: string }>();
  const openShop = useCallback(
    (shops: Array<Shop>, selected: string) => setShop({ shops, selected }),
    [],
  );
  const [stackToggled, setStackToggled] = useState(false);

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

  const selectTrainer = (key: string | undefined) =>
    setSelected({ scope, key });
  const viewFor = (target: LocationFloor | undefined) =>
    buildLocationView(
      {
        route,
        location,
        trail,
        dataPath,
        from: target?.id === floor?.id ? from : undefined,
        navigate,
        pokedexLink,
        openTownMap,
        openShop,
        selectTrainer,
      },
      target,
    );
  const floorData = viewFor;

  const {
    trainerGroups,
    pokedex,
    listedBattles,
    encounters,
    links,
    layerSections,
  } = floorData(floor);
  const highlightTo = (key: string | undefined) => setHighlight({ scope, key });
  const panelSections = stacked
    ? layerSections.map((section) => ({
        ...section,
        groups: section.groups.map((group) => ({
          ...group,
          entries: group.entries.map((entry) =>
            entry.replace ? { ...entry, href: stackedHref(entry.href) } : entry,
          ),
        })),
      }))
    : layerSections;
  const panelTabs = locationPanelTabs({
    route,
    dataPath,
    view: { trainerGroups, pokedex, listedBattles, encounters, links },
    sections: panelSections,
    hiddenLayers,
    onHighlight: highlightTo,
    onSelectTrainer: selectTrainer,
    onPin: (key) => setPinRequest({ scope, key }),
  });

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

  const imageFor = (target: LocationFloor) => {
    const source =
      target.event && eventState === 'after' ? target.event : target;
    const match = source.variants?.find((entry) =>
      entry.games.includes(route.game.id),
    );

    return match?.image ?? source.image;
  };
  const stackLayout =
    stacked && location.floors && floor
      ? stackFloors(location.floors, imageFor, floorLayouts[location.id])
      : undefined;
  const stackedData = stackLayout
    ? stackLayout.floors.map((placed) => {
        const data =
          placed.id === floor?.id
            ? { links, listedBattles }
            : floorData(location.floors?.find(({ id }) => id === placed.id));

        return {
          listedBattles: data.listedBattles,
          links: data.links.map((link) => ({
            ...offsetLink(
              {
                ...link,
                href: link.replace ? stackedHref(link.href) : link.href,
              },
              placed.x,
              placed.y,
            ),
            floorId: placed.id,
          })),
        };
      })
    : undefined;
  const viewLinks = stackedData?.flatMap((data) => data.links) ?? links;
  const dialogBattles =
    stackedData?.flatMap((data) => data.listedBattles) ?? listedBattles;

  const worldTile =
    trail.length === 1 && route.region.world?.[trail[0].id]
      ? trail[0].id
      : undefined;
  const pickers = ((location.floors && floor) || event || worldTile) && (
    <>
      {worldTile && (
        <WorldSwitch
          world={false}
          labels={['Focus View', 'World View']}
          worldFirst
          onChange={() => {
            setWorldPreferred(true);
            navigate(route.href(worldTile));
          }}
        />
      )}
      {location.floors && floor && (
        <FloorPicker
          floors={location.floors}
          selected={floor.id}
          onSelect={selectFloor}
          stacked={stacked}
          onStackedChange={(on) => {
            setStackToggled(true);
            setStacked(on);
          }}
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
  const panelTitle =
    floor && location.floors && location.floors.length > 1
      ? `${location.name} - ${floor.name}`
      : location.name;
  const cards = (
    <>
      <AsideCard icon={MapIcon} label="Town Map" onMobileOpen={openTownMap}>
        <TownMapCard
          region={route.region}
          path={trailPath(trail)}
          href={route.href}
        />
      </AsideCard>
      <AsideCard icon={Info} label="Location info" grow>
        <LocationPanel
          tabs={panelTabs}
          title={panelTitle}
          className="min-h-0 flex-1"
        />
      </AsideCard>
    </>
  );
  const viewer = (
    <MapViewer
      map={
        stackLayout
          ? {
              ...mapImage,
              image: `stack:${location.id}`,
              width: stackLayout.width,
              height: stackLayout.height,
            }
          : mapImage
      }
      stack={
        stackLayout && floor
          ? {
              floors: stackLayout.floors,
              selected: floor.id,
              onSelect: selectFloor,
              flyOnMount: floorRequested && !stackToggled,
            }
          : undefined
      }
      links={viewLinks.filter((link) => !hiddenLayers.has(link.layer))}
      highlightable={viewLinks}
      highlighted={
        (highlight.scope === scope ? highlight.key : undefined) ??
        focusKey ??
        arrival
      }
      focusKey={requestedFocus ?? arrivedAt}
      pinRequest={
        focusRequest ?? (pinRequest?.scope === scope ? pinRequest : undefined)
      }
      zoomPosition="bottomleft"
      className="size-full"
    />
  );

  return (
    <>
      <div className="relative h-[max(30rem,calc(100svh-3.5rem-1px))] overflow-x-clip">
        <div className="absolute inset-x-0 -top-[57px] bottom-0">
          <div className="absolute inset-0 flex flex-col overflow-hidden">
            <PageTransition mapMotion>
              <div className="relative flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1">{viewer}</div>
                {pickers && (
                  <div className="pointer-events-none absolute inset-x-14 bottom-4 z-10 flex flex-col items-center gap-2">
                    {pickers}
                  </div>
                )}
              </div>
            </PageTransition>
          </div>
        </div>
        <GameAside>{cards}</GameAside>
      </div>
      {pokedex && (
        <TrainerDialog
          listed={
            selected.scope === scope
              ? dialogBattles.find((listed) => listed.key === selected.key)
              : undefined
          }
          battles={dialogBattles}
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
      <ShopDialog shop={shop} onClose={() => setShop(undefined)} />
      <Pokedex game={route.game} region={route.region} href={route.href} />
    </>
  );
};
