import { useCallback, useEffect, useState } from 'react';

import { Gamepad2, Info, Map as MapIcon } from 'lucide-react';
import { useNavigate } from 'react-router';

import { MapViewer } from '@/components/map/MapViewer';
import type { MapLink } from '@/components/map/viewer/types';
import {
  handOffView,
  hasHandedOffView,
} from '@/components/map/viewer/viewHandoff';
import { regionHref, worldRegions } from '@/data/maps';
import type { Shop } from '@/data/shops/types';
import type { GameRoute } from '@/hooks/useGameRoute';
import { useSettingsStore } from '@/stores/settings';

import { AsideCard, GameAside } from '../GameAside';
import type { LayeredMapLink } from '../Location/links/types';
import { LocationPanel } from '../Location/LocationPanel';
import { locationPanelTabs } from '../Location/locationPanelTabs';
import { buildLocationView } from '../Location/locationView';
import { useMapLayers } from '../Location/mapLayers';
import { ShopDialog } from '../Location/ShopDialog';
import { offsetLink } from '../Location/stackLayout';
import { TownMapCard } from '../Location/TownMapCard';
import { TownMapDialog } from '../Location/TownMapDialog';
import { TrainerDialog } from '../Location/TrainerDialog';
import { Pokedex } from '../Pokedex/Pokedex';
import { usePokedexLink } from '../Pokedex/usePokedex';
import { GameInfoCard } from './GameInfoCard';
import { WorldToggle } from './WorldToggle';

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
  const at = selected ? world[selected.id] : undefined;
  const dataPath = selected ? (selected.dataPath ?? selected.id) : '';
  const view = selected
    ? buildLocationView(
        {
          route,
          location: selected,
          trail: [selected],
          dataPath,
          navigate,
          pokedexLink,
          openTownMap: () => setTownMapOpen(true),
          openShop: (shops, selected) => setShop({ shops, selected }),
          selectTrainer: setTrainerKey,
        },
        undefined,
      )
    : undefined;

  const placeLink = (link: LayeredMapLink): MapLink => {
    const target = WORLD_HREF.exec(link.href ?? '')?.[1];
    const toTile = target && world[target] ? target : undefined;
    const moved = offsetLink(
      toTile
        ? { ...link, href: undefined, onClick: () => selectTile(toTile) }
        : link,
      at?.x ?? 0,
      at?.y ?? 0,
    );

    return { ...moved, floorId: selected?.id };
  };
  const links = view?.links.map(placeLink) ?? [];
  const visibleLinks =
    view?.links
      .filter((link) => !hiddenLayers.has(link.layer))
      .map(placeLink) ?? [];

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
              flyOnMount: Boolean(selected) && !handedOff,
              faded,
              outlineSelected: false,
            }}
            links={visibleLinks}
            highlightable={links}
            highlighted={highlight}
            pinRequest={pinRequest ? { key: pinRequest } : undefined}
            zoomPosition="bottomleft"
            className="size-full"
          />
          {selected && (
            <WorldToggle
              world
              labels={['Focus View', 'World View']}
              worldFirst
              onChange={(next) => {
                if (next) return;

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
