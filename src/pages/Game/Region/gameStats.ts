import {
  type Game,
  type GameContentSection,
  gamesSharingMap,
} from '@/data/games';
import { itemsFor } from '@/data/items';
import type { Region } from '@/data/maps';
import { npcsFor } from '@/data/npcs';
import { pokedexFor } from '@/data/pokedex';
import { signsFor } from '@/data/signs';
import { staticPokemonFor } from '@/data/static-pokemon';
import { trainersFor } from '@/data/trainers';

import { collectPlaces } from '../places';

const WILD_METHODS = ['walk', 'surf', 'old-rod', 'good-rod', 'super-rod'];

export type GameStats = {
  pokedexSize: number;
  obtainableWithoutTrading?: number;
  obtainableExcluding?: string;
  versionExclusives?: number;
  wildSpecies: number;
  megaEvolutions: number;
  items?: { total: number; hidden: number };
  trainers?: number;
  npcs?: number;
  signs?: number;
  staticPokemon?: number;
  places?: number;
};

const available = (game: Game, section: GameContentSection) =>
  game.contentStatus?.find((entry) => entry.section === section)?.status !==
  'missing';

const countFor = <T extends { games: Array<string> }>(
  entries: Array<T> | undefined,
  game: Game,
) => {
  const own = entries?.filter((entry) => entry.games.includes(game.id));

  return own && own.length > 0 ? own : undefined;
};

export const gameStats = (game: Game, region: Region): GameStats => {
  const entries = pokedexFor(region.versionGroup) ?? [];
  const sharing = gamesSharingMap(game).length > 1;
  const items = available(game, 'items')
    ? countFor(itemsFor(region.versionGroup), game)
    : undefined;
  const trainers = available(game, 'trainer-battles')
    ? countFor(trainersFor(region.versionGroup), game)
    : undefined;
  const staticPokemon = available(game, 'static-gift-pokemon')
    ? countFor(staticPokemonFor(region.versionGroup), game)
    : undefined;
  const hasMapData = available(game, 'map-tile-data');
  const npcs = hasMapData
    ? countFor(npcsFor(region.versionGroup), game)
    : undefined;
  const signs = hasMapData
    ? countFor(signsFor(region.versionGroup), game)
    : undefined;
  const places = hasMapData ? collectPlaces(region, game.id).length : undefined;

  return {
    pokedexSize: region.pokedexSize,
    obtainableWithoutTrading: game.obtainableWithoutTrading,
    obtainableExcluding: game.obtainableExcluding,
    versionExclusives: sharing
      ? entries.filter(
          (entry) => entry.games.length === 1 && entry.games[0] === game.id,
        ).length
      : undefined,
    wildSpecies: entries.filter((entry) =>
      entry.encounters.some(
        (encounter) =>
          WILD_METHODS.includes(encounter.method) &&
          encounter.games.includes(game.id),
      ),
    ).length,
    megaEvolutions: entries.reduce(
      (total, entry) => total + (entry.megas?.length ?? 0),
      0,
    ),
    items: items && {
      total: items.length,
      hidden: items.filter((item) => item.hidden).length,
    },
    trainers: trainers?.length,
    npcs: npcs?.length,
    signs: signs?.length,
    staticPokemon: staticPokemon?.length,
    places: places || undefined,
  };
};
