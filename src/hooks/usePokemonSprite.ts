import { useThemeStyle } from '@/components/settings/themes';
import type { Game } from '@/data/games';
import {
  gameSprite,
  megaSprite,
  pokemonSprite,
  showdownMegaSprite,
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
      src: fromGame ?? pokemonSprite(number),
      pixelated,
      pixelArt: !fromGame || pixelated,
    };
  };
};

export const useMegaSprite = () => {
  const style = useThemeStyle('sprites');

  return (number: number, form?: string): PokemonSprite => {
    const fromShowdown =
      style === 'tall-grass' ? showdownMegaSprite(number, form) : undefined;

    if (fromShowdown) {
      return {
        src: fromShowdown.src,
        pixelated: false,
        pixelArt: fromShowdown.pixelArt,
      };
    }

    return {
      src: megaSprite(number, form),
      pixelated: false,
      pixelArt: false,
    };
  };
};
