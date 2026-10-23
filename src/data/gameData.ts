import type { MapItem } from './items/types';
import type { Mission } from './missions/types';
import type { MapNpc } from './npcs/types';
import type { PokedexEntry } from './pokedex/types';
import type { Shop } from './shops/types';
import type { MapSign } from './signs/types';
import type { StaticPokemon } from './static-pokemon/types';
import type { TrainerBattle } from './trainers/types';

export type GameData = {
  pokedex?: Array<PokedexEntry>;
  trainers?: Array<TrainerBattle>;
  npcs?: Array<MapNpc>;
  signs?: Array<MapSign>;
  items?: Array<MapItem>;
  staticPokemon?: Array<StaticPokemon>;
  shops?: Array<Shop>;
  missions?: Array<Mission>;
};

const loaders: Record<string, () => Promise<GameData>> = {
  RBY: async () => {
    const [pokedex, trainers, npcs, signs, items, staticPokemon, shops] =
      await Promise.all([
        import('./pokedex/rby'),
        import('./trainers/rby'),
        import('./npcs/rby'),
        import('./signs/rby'),
        import('./items/rby'),
        import('./static-pokemon/rby'),
        import('./shops/rby'),
      ]);

    return {
      pokedex: pokedex.rbyPokedex,
      trainers: trainers.rbyTrainers,
      npcs: npcs.rbyNpcs,
      signs: signs.rbySigns,
      items: items.rbyItems,
      staticPokemon: staticPokemon.rbyStaticPokemon,
      shops: shops.rbyShops,
    };
  },
  ZA: async () => {
    const [pokedex, trainers, missions] = await Promise.all([
      import('./pokedex/za'),
      import('./trainers/za'),
      import('./missions/za'),
    ]);

    return {
      pokedex: pokedex.zaPokedex,
      trainers: trainers.zaTrainers,
      missions: missions.zaMissions,
    };
  },
};

const loaded: Partial<Record<string, GameData>> = {};

export const gameDataFor = (versionGroup: string) => loaded[versionGroup];

export const loadGameData = async (...versionGroups: Array<string>) => {
  await Promise.all(
    versionGroups.map(async (versionGroup) => {
      const load = loaders[versionGroup];

      if (load && !loaded[versionGroup]) loaded[versionGroup] = await load();
    }),
  );
};

export const loadAllGameData = () => loadGameData(...Object.keys(loaders));
