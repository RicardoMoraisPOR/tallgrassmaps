import { useThemeStyle } from '@/components/settings/themes';
import type { Game } from '@/data/games';
import { gameSprite, pokemonSprite } from '@/data/sprites';

export type PokemonSprite = { src: string; pixelated: boolean };

export const usePokemonSprite = (game: Game) => {
  const style = useThemeStyle('sprites');

  return (number: number): PokemonSprite => {
    const fromGame = style === 'game' ? gameSprite(number, game) : undefined;

    return { src: fromGame ?? pokemonSprite(number), pixelated: !!fromGame };
  };
};
