import { useThemeStyle } from '@/components/settings/themes';
import type { Game } from '@/data/games';
import {
  gameSprite,
  megaSprite,
  pokeapiMegaSprite,
  pokeapiSprite,
} from '@/data/sprites';

export type PokemonSprite = {
  src: string;
  pixelated: boolean;
  pixelArt: boolean;
};

export const usePokemonSprite = (game: Game) => {
  const style = useThemeStyle('sprites');

  return (number: number): PokemonSprite => {
    const fromGame = style === 'game' ? gameSprite(number, game) : undefined;

    const pixelated = !!fromGame && (game.sprites?.pixelated ?? true);

    return {
      src: fromGame ?? pokeapiSprite(number),
      pixelated,
      pixelArt: !fromGame || pixelated,
    };
  };
};

export const useMegaSprite = () => {
  const style = useThemeStyle('sprites');

  return (number: number, form?: string): PokemonSprite => {
    const fromPokeapi =
      style === 'tall-grass' ? pokeapiMegaSprite(number, form) : undefined;

    if (fromPokeapi) {
      return {
        src: fromPokeapi.src,
        pixelated: false,
        pixelArt: fromPokeapi.pixelArt,
      };
    }

    return {
      src: megaSprite(number, form),
      pixelated: false,
      pixelArt: false,
    };
  };
};
