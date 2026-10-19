import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Gamepad2, Info, Map as MapIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

import { MapViewer } from '@/components/map/MapViewer';
import type { MapLink } from '@/components/map/viewer/types';
import { useProgressiveLinks } from '@/components/map/viewer/useProgressiveLinks';
import {
  handOffView,
  hasHandedOffView,
} from '@/components/map/viewer/viewHandoff';
import { regionHref, worldRegions } from '@/data/maps';
import type { Shop } from '@/data/shops/types';
import type { GameRoute } from '@/hooks/useGameRoute';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings';

import { AsideCard, GameAside } from '../GameAside';
import type { LayeredMapLink } from '../Location/links/types';
import { LocationPanel } from '../Location/LocationPanel';
import { locationPanelTabs } from '../Location/locationPanelTabs';
import { buildLocationView } from '../Location/locationView';
import {
  CLOSE_ZOOM,
  layersHiddenAtTier,
  type MapLayerId,
  useMapLayers,
  zoomTier,
} from '../Location/mapLayers';
import { ShopDialog } from '../Location/ShopDialog';
import { offsetLink } from '../Location/stackLayout';
import { TownMapCard } from '../Location/TownMapCard';
import { TownMapDialog } from '../Location/TownMapDialog';
import { TrainerDialog } from '../Location/TrainerDialog';
import { Pokedex } from '../Pokedex/Pokedex';
import { usePokedexLink } from '../Pokedex/usePokedex';
import { findMatchKey, useMapFind } from '../Search/mapFind';
import { FindBanner } from './FindBanner';
import { GameInfoCard } from './GameInfoCard';
import { useLayerFade } from './useLayerFade';
import { useViewParam } from './useViewParam';
import { WorldToggle } from './WorldToggle';

const clusterGroups: Array<{
  label: string;
  color: string;
  layers: Array<MapLayerId>;
}> = [
  {
    label: 'Entrances',
    color: 'var(--map-entrance)',
    layers: ['buildings', 'services'],
  },
  { label: 'Trainers', color: 'var(--map-trainer)', layers: ['trainers'] },
  {
    label: 'NPCs',
    color: 'var(--map-npc)',
    layers: ['npcs', 'special-npcs'],
  },
  {
    label: 'Items',
    color: 'var(--map-item)',
    layers: ['items', 'hidden-items'],
  },
  {
    label: 'Static Pokémon',
    color: 'var(--map-static-pokemon)',
    layers: ['static-pokemon'],
  },
];

const FADE_START_MS = 50;
const FADE_OUT_MS = 150;

const WORLD_HREF = /^\/[^/]+\/[^/]+\/([^/?#]+)(?:[?#].*)?$/;

export const WorldMapPage = ({ route }: { route: GameRoute }) => {
  const { game, region, href } = route;
  const regions = worldRegions(route.regions, region);
  const navigate = useNavigate();
  const pokedexLink = usePokedexLink();
  const hiddenLayers = useMapLayers('world');
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
  const { search } = useLocation();
  const deselect = () =>
    navigate({ pathname: regionHref(game.id, region), search });
  const [handedOff] = useState(hasHandedOffView);
  const [faded, setFaded] = useState(handedOff);

  useEffect(() => {
    const timer = setTimeout(() => setFaded(false), FADE_START_MS);

    return () => clearTimeout(timer);
  }, []);

  const [townMapOpen, setTownMapOpen] = useState(false);
  const openTownMap = useCallback(() => setTownMapOpen(true), [setTownMapOpen]);
  const [shop, setShop] = useState<{ shops: Array<Shop>; selected: string }>();
  const [trainerKey, setTrainerKey] = useState<string>();
  const [highlight, setHighlight] = useState<string>();
  const [pinRequest, setPinRequest] = useState<string>();

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
    if (tier === undefined || tier >= 2 || find.query) return undefined;

    return placed.flatMap((location) => {
      const data = tiles.get(location.id);
      const groups = clusterGroups.flatMap(({ label, color, layers }) => {
        const count =
          data?.links.filter(
            (link) =>
              layers.includes(link.layer) && !hiddenLayers.has(link.layer),
          ).length ?? 0;

        return count > 0 ? [{ label, color, count }] : [];
      });
      const total = groups.reduce((sum, { count }) => sum + count, 0);
      const counts =
        tier === 0
          ? [{ label: 'Markers', color: 'var(--brand)', count: total }]
          : groups;

      return total > 0
        ? [
            {
              tileId: location.id,
              x: world[location.id].x + location.width / 2,
              y: world[location.id].y + location.height / 2,
              compact: tier === 0,
              counts,
            },
          ]
        : [];
    });
  }, [tier, find.query, tiles, userHiddenKey, placedKey]);

  const renderedLinks = useProgressiveLinks(visibleLinks, fading.length > 0);

  const panel =
    view && selected ? (
      <LocationPanel
        tabs={locationPanelTabs({
          route,
          dataPath,
          view,
          sections: view.layerSections,
          hiddenLayers: hiddenNow,
          onHighlight: setHighlight,
          onSelectTrainer: setTrainerKey,
          onPin: setPinRequest,
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
              flyOnMount:
                Boolean(selected) && !handedOff && !sharedView.restored,
              faded,
              outlineSelected: false,
              dottedSelected: true,
              actOnAnyFloor: true,
              dimmed,
            }}
            links={renderedLinks}
            highlightable={links}
            highlighted={highlight}
            pinRequest={pinRequest ? { key: pinRequest } : undefined}
            fitBounds={findBounds}
            onViewChange={sharedView.remember}
            clusters={clusters}
            clusterZoom={CLOSE_ZOOM}
            onDeselect={selected ? deselect : undefined}
            onZoomChange={(zoom) => setTier(zoomTier(zoom))}
            zoomPosition="bottomleft"
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
          {selected && (
            <WorldToggle
              world
              labels={['Focus View', 'World View']}
              worldFirst
              onChange={(next) => {
                if (next) return;

                const at = selected ? world[selected.id] : undefined;

                setFaded(true);
                setTimeout(() => {
                  if (at) handOffView(-at.x, -at.y);

                  setWorldPreferred(false);
                }, FADE_OUT_MS);
              }}
            />
          )}
        </div>
        <GameAside mapLayers="world">
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
