import type { NavigateFunction } from 'react-router';

import { itemsFor } from '@/data/items';
import {
  inGame,
  type Location,
  type LocationFloor,
  locationInGame,
  type WildArea,
} from '@/data/maps';
import { npcsFor } from '@/data/npcs';
import { pokedexFor } from '@/data/pokedex';
import { shopsFor } from '@/data/shops';
import type { Shop } from '@/data/shops/types';
import { signsFor } from '@/data/signs';
import { staticPokemonFor } from '@/data/static-pokemon';
import { trainersFor } from '@/data/trainers';
import type { GameRoute } from '@/hooks/useGameRoute';
import { trailPath } from '@/lib/paths';

import { usePokedexLink } from '../Pokedex/usePokedex';
import { encounterGroups, wildAreaFor } from './encounters';
import { openableNames } from './links/signs';
import { locationLinks } from './locationLinks';
import { MapTextTooltip } from './MapTextTooltip';
import { battleGroups } from './trainerList';
import { TrainerTooltip } from './TrainerTooltip';
import { StaticPopup, WildPopup } from './WildPopup';

export type LocationViewContext = {
  route: GameRoute;
  location: Location;
  trail: Array<Location>;
  dataPath: string;
  from?: string;
  navigate: NavigateFunction;
  pokedexLink: ReturnType<typeof usePokedexLink>;
  openTownMap: () => void;
  openShop: (shops: Array<Shop>, selected: string) => void;
  selectTrainer: (key: string | undefined) => void;
};

export const buildLocationView = (
  {
    route,
    location,
    trail,
    dataPath,
    from,
    navigate,
    pokedexLink,
    openTownMap,
    openShop,
    selectTrainer,
  }: LocationViewContext,
  target: LocationFloor | undefined,
) => {
  const pokedex = pokedexFor(route.region.versionGroup);
  const trainers = trainersFor(route.region.versionGroup);

  const trainerGroups = trainers
    ? battleGroups(trainers, {
        game: route.game,
        path: dataPath,
        floor: target?.id,
        onMapOnly: location.kind === 'town',
      })
    : [];
  const listedBattles = trainerGroups.flatMap((group) => group.battles);
  const onThisMap = (marker: {
    path: string;
    floor?: string;
    games: Array<string>;
  }) =>
    marker.path === dataPath &&
    marker.floor === target?.id &&
    marker.games.includes(route.game.id);
  const wildAreas =
    route.region.wildAreas?.filter(
      (area) =>
        area.path === dataPath &&
        area.floor === target?.id &&
        inGame(area, route.game.id),
    ) ?? [];
  const encounters = pokedex
    ? encounterGroups(pokedex, {
        game: route.game,
        path: dataPath,
        floor: target?.id,
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

  const gameShops =
    shopsFor(route.region.versionGroup)?.filter(({ games }) =>
      games.includes(route.game.id),
    ) ?? [];

  const { links, layerSections } = locationLinks(
    route.region,
    locationInGame(location, route.game.id),
    trailPath(trail),
    route.href,
    route.game.tileSize,
    target,
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
        else openTownMap();
      },
      shops: gameShops.filter(onThisMap),
      entranceShops: gameShops,
      onOpenShop: openShop,
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

  return {
    trainerGroups,
    pokedex,
    listedBattles,
    encounters,
    links,
    layerSections,
  };
};
