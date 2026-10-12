import { coverIdsFrom, getCover } from '@/data/covers';
import { getGame } from '@/data/games';
import { npcsFor } from '@/data/npcs';
import { pokedexFor } from '@/data/pokedex';
import showdownMegas from '@/data/pokedex/za/showdown-megas.json';
import {
  gameSprite,
  megaSprite,
  megaStoneSprite,
  pokemonSprite,
} from '@/data/sprites';
import { staticPokemonFor } from '@/data/static-pokemon';
import { trainersFor } from '@/data/trainers';

export type SpriteTile = { src: string; label: string; pixelated?: boolean };

export type SpriteGroup = {
  title: string;
  sprites: Array<SpriteTile>;
  large?: boolean;
};

const LAST_BLACK_WHITE_NUMBER = 649;
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
  'Pokémon Showdown': () => [
    {
      title: 'Pokémon',
      sprites: numbered(range(1, LAST_BLACK_WHITE_NUMBER), pokemonSprite),
    },
    {
      title: 'Mega Evolutions',
      sprites: Object.entries(showdownMegas).map(([key, kind]) => ({
        src: `/sprites/pokemon/mega/${key}.png`,
        label: `#${key}`,
        pixelated: kind === 'pixel',
      })),
    },
  ],
  'Smogon Sprite Project': () => [
    {
      title: 'Pokémon added after Black and White',
      sprites: numbered(
        range(LAST_BLACK_WHITE_NUMBER + 1, LAST_NUMBER),
        pokemonSprite,
      ),
    },
  ],
  'Bulbagarden Archives': () => {
    const entries = pokedexFor('ZA') ?? [];
    const megas = entries.flatMap(({ number, megas: forms = [] }) =>
      forms.map((mega) => ({ number, ...mega })),
    );

    return [
      {
        title: 'Legends Z-A menu sprites',
        sprites: gameNumbers(
          'legends-za',
          entries.map(({ number }) => number),
        ),
      },
      {
        title: 'Mega Evolution menu sprites',
        sprites: megas.map(({ number, form, stone }) => ({
          src: megaSprite(number, form),
          label: stone,
        })),
      },
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
