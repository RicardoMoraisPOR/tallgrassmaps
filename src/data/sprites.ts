import type { MapSource } from './maps';

export const pokemonSpriteSources = {
  showdown: {
    name: 'Pokémon Showdown',
    url: 'https://pokemonshowdown.com/',
    credit: 'the Pokémon Showdown team',
  },
  smogon: {
    name: 'Smogon Sprite Project',
    url: 'https://pokemonshowdown.com/credits',
    credit: 'the Smogon Sprite Project artists',
  },
} satisfies Record<string, MapSource>;

export const pokemonSprite = (number: number) =>
  `/sprites/pokemon/${number}.png`;
