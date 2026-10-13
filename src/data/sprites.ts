import type { Game } from './games';
import type { MapSource } from './maps';
import { getSpecies } from './pokedex/master';

export const pokemonSpriteSources = {
  pret: {
    name: 'pret',
    url: 'https://github.com/pret',
    credit: 'the pret team',
  },
  pokeapi: {
    name: 'PokeAPI',
    url: 'https://github.com/PokeAPI/sprites',
    credit: 'the PokeAPI team',
  },
  bulbagarden: {
    name: 'Bulbagarden Archives',
    url: 'https://archives.bulbagarden.net/',
    credit: 'the Bulbagarden community',
  },
} satisfies Record<string, MapSource>;

export const pokeapiSprite = (id: number) =>
  `/sprites/pokemon/pokeapi/${id}.png`;

export const gameSprite = (number: number, game: Game) =>
  game.sprites && number <= game.sprites.count
    ? `/sprites/pokemon/${game.sprites.set}/${number}.${game.sprites.extension ?? 'png'}`
    : undefined;

export const megaSprite = (number: number, form?: string) =>
  `/sprites/pokemon/legends-za/mega/${number}${form ? `-${form.toLowerCase()}` : ''}.webp`;

export const megaStoneSprite = (stone: string) =>
  `/sprites/items/mega-stones/${stone.toLowerCase().replaceAll(' ', '-')}.png`;

export const pokeapiMegaSprite = (number: number, form?: string) => {
  const spriteId = getSpecies(number)?.transformations?.find(
    (transformation) => transformation.form === form,
  )?.spriteId;

  return spriteId
    ? { src: pokeapiSprite(spriteId), pixelArt: true }
    : undefined;
};
