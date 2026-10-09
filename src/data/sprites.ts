import type { Game } from './games';
import type { MapSource } from './maps';
import showdownMegas from './pokedex/za/showdown-megas.json';

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
  bulbagarden: {
    name: 'Bulbagarden Archives',
    url: 'https://archives.bulbagarden.net/',
    credit: 'the Bulbagarden community',
  },
} satisfies Record<string, MapSource>;

export const pokemonSprite = (number: number) =>
  `/sprites/pokemon/${number}.png`;

export const gameSprite = (number: number, game: Game) =>
  game.sprites && number <= game.sprites.count
    ? `/sprites/pokemon/${game.sprites.set}/${number}.${game.sprites.extension ?? 'png'}`
    : undefined;

export const megaSprite = (number: number, form?: string) =>
  `/sprites/pokemon/legends-za/mega/${number}${form ? `-${form.toLowerCase()}` : ''}.webp`;

export const megaStoneSprite = (stone: string) =>
  `/sprites/items/mega-stones/${stone.toLowerCase().replaceAll(' ', '-')}.png`;

export const showdownMegaSprite = (number: number, form?: string) => {
  const key = `${number}${form ? `-${form.toLowerCase()}` : ''}`;

  const kind = (showdownMegas as Record<string, 'pixel' | 'render'>)[key];

  return kind
    ? { src: `/sprites/pokemon/mega/${key}.png`, pixelArt: kind === 'pixel' }
    : undefined;
};
