import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Gamepad2, Info, Map as MapIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

import { MapViewer } from '@/components/map/MapViewer';
import type { MapLink } from '@/components/map/viewer/types';
import { regionHref, worldRegions } from '@/data/maps';
import type { Shop } from '@/data/shops/types';
import type { GameRoute } from '@/hooks/useGameRoute';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings';

import { AsideCard, GameAside } from '../GameAside';
import { arrivalKey } from '../Location/links/arrivals';
import type { LayeredMapLink } from '../Location/links/types';
import { LocationPanel } from '../Location/LocationPanel';
import { locationPanelTabs } from '../Location/locationPanelTabs';
import { buildLocationView } from '../Location/locationView';
import {
  layersHiddenAtTier,
  useMapLayers,
  zoomTier,
} from '../Location/mapLayers';
import { ShopDialog } from '../Location/ShopDialog';
import { offsetLink } from '../Location/stackLayout';
import { TownMapCard } from '../Location/TownMapCard';
import { TownMapDialog } from '../Location/TownMapDialog';
import { TrainerDialog } from '../Location/TrainerDialog';
import { useMapPalette } from '../Location/useMapPalette';
import { Pokedex } from '../Pokedex/Pokedex';
import { usePokedexLink } from '../Pokedex/usePokedex';
import { findMatchKey, useMapFind } from '../Search/mapFind';
import { FindBanner } from './FindBanner';
import { GameInfoCard } from './GameInfoCard';
import { useLayerFade } from './useLayerFade';
import { useViewParam } from './useViewParam';

const ARRIVAL_HIGHLIGHT_MS = 1500;

const WORLD_HREF = /^\/[^/]+\/[^/]+\/([^/?#]+)(?:[?#].*)?$/;

export const WorldMapPage = ({ route }: { route: GameRoute }) => {
  const { game, region, href } = route;
  const regions = worldRegions(route.regions, region);
  const navigate = useNavigate();
  const pokedexLink = usePokedexLink();
  const hiddenLayers = useMapLayers();
  const palette = useMapPalette(game.id, (floorId) => ({
    path: floorId ?? '',
  }));
  const clusterZoom = useSettingsStore((state) => state.clusterZoom);
  const setWorldPreferred = useSettingsStore((state) => state.setWorldView);
  const tile = route.trail?.[0]?.id;
  const world = Object.assign({}, ...regions.map((entry) => entry.world));
  const regionOfTile = (id: string | undefined) =>
    regions.find(({ locations }) =>
      locations.some((entry) => entry.id === id),
    ) ?? region;
  const selectTile = (id: string | undefined) => {
    setWorldPreferred(true);
    navigate(regionHref(game.id, regionOfTile(id), id));
  };
  const sharedView = useViewParam();
  const { search, state: navState, key: locationKey } = useLocation();
  const [arrivalShown, setArrivalShown] = useState<string>();
  const requestedFocus = (navState as { focusKey?: string } | null)?.focusKey;
  const via = new URLSearchParams(search).get('via');
  const arrivedAt = via && !requestedFocus ? arrivalKey(via) : undefined;
  const arrival = arrivalShown === locationKey ? undefined : arrivedAt;
  const deselect = () =>
    navigate({ pathname: regionHref(game.id, region), search });
  const [townMapOpen, setTownMapOpen] = useState(false);
  const openTownMap = useCallback(() => setTownMapOpen(true), [setTownMapOpen]);
  const [shop, setShop] = useState<{ shops: Array<Shop>; selected: string }>();
  const [trainerKey, setTrainerKey] = useState<string>();
  const [highlight, setHighlight] = useState<string>();
  const [pinRequest, setPinRequest] = useState<{
    key: string;
    initial?: boolean;
  }>();

  useEffect(() => {
    if (!arrivedAt) return undefined;

    const timer = setTimeout(
      () => setArrivalShown(locationKey),
      ARRIVAL_HIGHLIGHT_MS,
    );

    return () => clearTimeout(timer);
  }, [arrivedAt, locationKey]);

  useEffect(() => {
    if (requestedFocus) setPinRequest({ key: requestedFocus, initial: true });
  }, [locationKey, requestedFocus]);

  const placed = regions
    .flatMap(({ locations }) => locations)
    .filter(({ id }) => world[id]);
  const floors = placed.map((location) => {
    const variant = location.variants?.find((entry) =>
      entry.games.includes(game.id),
    );

    return {
      id: location.id,
      name: location.name,
      image: variant?.image ?? location.image,
      pixelated: location.pixelated,
      x: world[location.id].x,
      y: world[location.id].y,
      width: location.width,
      height: location.height,
    };
  });
  const width = Math.max(...floors.map(({ x, width: w }) => x + w));
  const height = Math.max(...floors.map(({ y, height: h }) => y + h));

  const selected = placed.find(({ id }) => id === tile);
  const dataPath = selected ? (selected.dataPath ?? selected.id) : '';
  const placedKey = placed.map(({ id }) => id).join('|');
  const latestPokedexLink = useRef(pokedexLink);

  latestPokedexLink.current = pokedexLink;

  const stablePokedexLink = useMemo(
    () => ({
      get to() {
        return latestPokedexLink.current.to;
      },
      get state() {
        return latestPokedexLink.current.state;
      },
    }),
    [],
  );
  const tiles = useMemo(() => {
    const placeLink = (link: LayeredMapLink, tileId: string): MapLink => {
      const target = WORLD_HREF.exec(link.href ?? '')?.[1];
      const toTile = target && world[target] ? target : undefined;
      const at = world[tileId];
      const moved = offsetLink(
        toTile
          ? { ...link, href: undefined, onClick: () => selectTile(toTile) }
          : link,
        at.x,
        at.y,
      );

      return {
        ...moved,
        floorId: tileId,
        ...(moved.area && { area: { ...moved.area, floorId: tileId } }),
      };
    };

    return new Map(
      placed.map((location) => {
        const built = buildLocationView(
          {
            route,
            location,
            trail: [location],
            dataPath: location.dataPath ?? location.id,
            navigate,
            pokedexLink: stablePokedexLink,
            openTownMap: () => setTownMapOpen(true),
            openShop: (shops, selected) => setShop({ shops, selected }),
            selectTrainer: setTrainerKey,
          },
          undefined,
        );

        return [
          location.id,
          {
            view: built,
            dataPath: location.dataPath ?? location.id,
            links: built.links.map((link) => ({
              layer: link.layer,
              keys: [link.highlightKey].flat().filter(Boolean) as Array<string>,
              placed: placeLink(link, location.id),
            })),
          },
        ];
      }),
    );
  }, [game.id, region.id, placedKey, stablePokedexLink, navigate]);
  const view = selected ? tiles.get(selected.id)?.view : undefined;
  const links = selected
    ? (tiles.get(selected.id)?.links.map(({ placed: link }) => link) ?? [])
    : [];
  const find = useMapFind(game, region);
  const [tier, setTier] = useState<number>();
  const { hidden: hiddenNow, fading } = useLayerFade(
    new Set([...hiddenLayers, ...layersHiddenAtTier(tier)]),
  );
  const hiddenKey = [...hiddenNow].toSorted().join('|');
  const visibleLinks = useMemo(
    () =>
      [...tiles.values()].flatMap((tileData) =>
        tileData.links
          .filter(({ layer, keys }) =>
            find.query
              ? keys.some((key) =>
                  find.matches.has(findMatchKey(tileData.dataPath, key)),
                )
              : !hiddenNow.has(layer),
          )
          .map(({ placed: link }) => link),
      ),
    [tiles, hiddenKey, find.query, find.matches],
  );
  const dimmed = useMemo(
    () =>
      find.query
        ? new Set(
            placed
              .filter(({ id, dataPath: data }) => !find.tiles.has(data ?? id))
              .map(({ id }) => id),
          )
        : undefined,
    [find.query, find.tiles, placedKey],
  );
  const findBounds = useMemo(() => {
    if (!find.query || sharedView.restored) return undefined;

    const boxes = [
      ...visibleLinks.map(({ x, y, width, height }) => ({
        x,
        y,
        width,
        height,
      })),
      ...floors.filter(({ id }) => !dimmed?.has(id)),
    ];

    if (boxes.length === 0) return undefined;

    const minX = Math.min(...boxes.map(({ x }) => x));
    const minY = Math.min(...boxes.map(({ y }) => y));
    const maxX = Math.max(...boxes.map(({ x, width: w }) => x + w));
    const maxY = Math.max(...boxes.map(({ y, height: h }) => y + h));

    return {
      key: find.query,
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }, [find.query, visibleLinks, dimmed, sharedView.restored]);

  const userHiddenKey = [...hiddenLayers].toSorted().join('|');
  const clusters = useMemo(() => {
    if (tier !== 0 || find.query) return undefined;

    return placed.flatMap((location) => {
      const gymLink = hiddenLayers.has('buildings')
        ? undefined
        : tiles
            .get(location.id)
            ?.links.find(({ placed: link }) => link.icon?.kind === 'gym');
      const entries = [
        ...(gymLink
          ? [{ kind: 'gym' as const, label: gymLink.placed.label }]
          : []),
        ...regions.flatMap(({ overview }) => overview?.[location.id] ?? []),
      ].slice(0, 2);
      const kinds = entries.map(({ kind }) => kind);

      return kinds.length > 0
        ? [
            {
              tileId: location.id,
              x: world[location.id].x + location.width / 2,
              y: world[location.id].y + location.height / 2,
              kinds,
              label: entries.map(({ label }) => label).join(' · '),
            },
          ]
        : [];
    });
  }, [tier, find.query, tiles, userHiddenKey, placedKey]);

  const panel =
    view && selected ? (
      <LocationPanel
        tabs={locationPanelTabs({
          route,
          dataPath,
          view,
          sections: view.layerSections,
          hiddenLayers,
          onHighlight: setHighlight,
          onSelectTrainer: setTrainerKey,
          onPin: (key) => setPinRequest({ key }),
        })}
        title={selected.name}
        className="min-h-0 flex-1"
      />
    ) : undefined;

  return (
    <>
      <div className="relative h-[max(30rem,calc(100svh-3.5rem-1px))] overflow-x-clip">
        <div className="absolute inset-x-0 -top-[57px] bottom-0">
          <MapViewer
            map={{
              image: `world:${game.id}:${region.separateWorld ? region.id : 'shared'}`,
              width,
              height,
              pixelated: true,
              source: region.source,
            }}
            stack={{
              floors,
              selected: selected?.id ?? '',
              onSelect: selectTile,
              stayOnMapSelect: true,
              flyOnMount:
                Boolean(selected) && !sharedView.restored && !requestedFocus,
              outlineSelected: false,
              dottedSelected: true,
              actOnAnyFloor: true,
              dimmed,
            }}
            links={visibleLinks}
            highlightable={links}
            highlighted={highlight ?? arrival}
            focusKey={arrivedAt}
            pinRequest={pinRequest}
            fitBounds={findBounds}
            onViewChange={sharedView.remember}
            clusters={clusters}
            clusterZoom={clusterZoom}
            onDeselect={selected ? deselect : undefined}
            onZoomChange={(zoom) => setTier(zoomTier(zoom, clusterZoom))}
            zoomPosition="bottomleft"
            palette={palette}
            worldView={
              selected
                ? {
                    on: false,
                    onToggle: () => setWorldPreferred(false),
                  }
                : undefined
            }
            className={cn(
              'size-full',
              fading.map((id) => `map-fading-${id}`),
            )}
          />
          {find.query && (
            <FindBanner
              query={find.query}
              count={find.count}
              onClear={find.clear}
            />
          )}
        </div>
        <GameAside mapLayers>
          <AsideCard icon={MapIcon} label="Town Map" onMobileOpen={openTownMap}>
            <TownMapCard
              key={region.id}
              game={game}
              region={region}
              path={selected?.id ?? ''}
            />
          </AsideCard>
          <AsideCard icon={Gamepad2} label="Game info" drawer>
            <GameInfoCard game={game} region={region} pageButton />
          </AsideCard>
          {panel && (
            <AsideCard icon={Info} label="Location info" grow>
              {panel}
            </AsideCard>
          )}
        </GameAside>
      </div>
      {view?.pokedex && selected && (
        <TrainerDialog
          listed={view.listedBattles.find(({ key }) => key === trainerKey)}
          battles={view.listedBattles}
          place={selected.name}
          game={game}
          pokedex={view.pokedex}
          href={href}
          onSelect={setTrainerKey}
          onClose={() => setTrainerKey(undefined)}
        />
      )}
      <ShopDialog shop={shop} onClose={() => setShop(undefined)} />
      <TownMapDialog
        open={townMapOpen}
        game={game}
        region={region}
        path={selected?.id ?? ''}
        onClose={() => setTownMapOpen(false)}
      />
      <Pokedex game={game} region={region} href={href} />
    </>
  );
};
