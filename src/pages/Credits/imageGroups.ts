import { coverIdsFrom, getCover } from '@/data/covers';
import { getGame } from '@/data/games';
import { npcsFor } from '@/data/npcs';
import { pokedexFor } from '@/data/pokedex';
import { species } from '@/data/pokedex/master';
import {
  gameSprite,
  megaSprite,
  megaStoneSprite,
  pokeapiSprite,
  zaFormSprite,
} from '@/data/sprites';
import { staticPokemonFor } from '@/data/static-pokemon';
import { trainersFor } from '@/data/trainers';

export type SpriteTile = { src: string; label: string; pixelated?: boolean };

export type SpriteGroup = {
  title: string;
  sprites: Array<SpriteTile>;
  large?: boolean;
};

const LAST_NUMBER = 1025;
const KANTO_COUNT = 151;
const ITEM_SPRITE = '/sprites/rby/overworld/poke_ball.png';

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, index) => from + index);

const numbered = (numbers: Array<number>, src: (number: number) => string) =>
  numbers.map((number) => ({ src: src(number), label: `#${number}` }));

const overworldGroup = (): SpriteGroup => {
  const sources = new Set<string | undefined>([
    ITEM_SPRITE,
    ...(npcsFor('RBY') ?? []).map(({ sprite }) => sprite),
    ...(staticPokemonFor('RBY') ?? []).map(({ sprite }) => sprite),
    ...(trainersFor('RBY') ?? []).flatMap(({ sprite, partner }) => [
      sprite,
      partner?.sprite,
    ]),
  ]);

  return {
    title: 'People, trainers and items on the maps',
    sprites: [...sources]
      .filter((src): src is string => Boolean(src))
      .toSorted()
      .map((src) => ({
        src,
        label: (src.split('/').at(-1) ?? src)
          .replace(/\.png$/, '')
          .replaceAll('_', ' '),
        pixelated: true,
      })),
  };
};

const gameNumbers = (gameId: string, numbers: Array<number>) => {
  const game = getGame(gameId);

  return numbers.flatMap((number) => {
    const src = game && gameSprite(number, game);

    return src
      ? [
          {
            src,
            label: `#${number}`,
            pixelated: game.sprites?.pixelated ?? true,
          },
        ]
      : [];
  });
};

const coverGroup = (source: 'libretro' | 'thegamesdb'): Array<SpriteGroup> => [
  {
    title: 'Box art',
    large: true,
    sprites: coverIdsFrom(source).flatMap((id) => {
      const src = getCover(id);

      return src ? [{ src, label: getGame(id)?.fullName ?? id }] : [];
    }),
  },
];

const builders: Record<string, () => Array<SpriteGroup>> = {
  'libretro-thumbnails': () => coverGroup('libretro'),
  TheGamesDB: () => coverGroup('thegamesdb'),
  'pret/pokered and pret/pokeyellow': () => [
    {
      title: 'Red and Blue Pokémon',
      sprites: gameNumbers('red', range(1, KANTO_COUNT)),
    },
    {
      title: 'Yellow Pokémon',
      sprites: gameNumbers('yellow', range(1, KANTO_COUNT)),
    },
    overworldGroup(),
  ],
  PokeAPI: () => {
    const zaGroups = (): Array<SpriteGroup> => {
      const entries = pokedexFor('ZA') ?? [];
      const megas = entries.flatMap(({ number, megas: forms = [] }) =>
        forms.map((mega) => ({ number, ...mega })),
      );
      const regional = species.flatMap(({ regionalForms = [] }) =>
        regionalForms.flatMap(({ name, spriteId }) => {
          const src = zaFormSprite(spriteId);

          return src ? [{ src, label: name }] : [];
        }),
      );

      return [
        {
          title: 'Legends Z-A menu sprites',
          sprites: gameNumbers('legends-za', [
            ...new Set(entries.map(({ number }) => number)),
          ]),
        },
        {
          title: 'Legends Z-A Mega Evolution menu sprites',
          sprites: megas.map(({ number, form, stone }) => ({
            src: megaSprite(number, form),
            label: stone,
          })),
        },
        { title: 'Legends Z-A regional forms', sprites: regional },
      ];
    };

    const formSprites = (kind: 'regionalForms' | 'transformations') =>
      species.flatMap((entry) =>
        (entry[kind] ?? []).flatMap(({ name, spriteId }) =>
          spriteId ? [{ src: pokeapiSprite(spriteId), label: name }] : [],
        ),
      );

    return [
      {
        title: 'Pokémon',
        sprites: numbered(range(1, LAST_NUMBER), pokeapiSprite),
      },
      { title: 'Regional forms', sprites: formSprites('regionalForms') },
      { title: 'Mega Evolutions', sprites: formSprites('transformations') },
      ...zaGroups(),
    ];
  },
  'Bulbagarden Archives': () => {
    const entries = pokedexFor('ZA') ?? [];
    const megas = entries.flatMap(({ number, megas: forms = [] }) =>
      forms.map((mega) => ({ number, ...mega })),
    );

    return [
      {
        title: 'Mega Stones',
        sprites: [...new Set(megas.map(({ stone }) => stone))].map((stone) => ({
          src: megaStoneSprite(stone),
          label: stone,
        })),
      },
    ];
  },
};

export const hasImageGroups = (creditName: string) => creditName in builders;

export const imageGroupsFor = (creditName: string) =>
  builders[creditName]?.() ?? [];
