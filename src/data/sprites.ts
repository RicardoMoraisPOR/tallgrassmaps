import type { Game } from './games';
import type { MapSource } from './maps';

export const pokemonSpriteSources = {
  showdown: {
    name: 'Pokémon Showdown',
    url: 'https://pokemonshowdown.com/',
    credit: 'the Pokémon Showdown team',
  },
  pret: {
    name: 'pret',
    url: 'https://github.com/pret',
    credit: 'the pret team',
  },
  smogon: {
    name: 'Smogon Sprite Project',
    url: 'https://pokemonshowdown.com/credits',
    credit: 'the Smogon Sprite Project artists',
  },
} satisfies Record<string, MapSource>;

export const pokemonSprite = (number: number) =>
  `/sprites/pokemon/${number}.png`;

export const gameSprite = (number: number, game: Game) =>
  game.sprites && number <= game.sprites.count
    ? `/sprites/pokemon/${game.sprites.set}/${number}.png`
    : undefined;
