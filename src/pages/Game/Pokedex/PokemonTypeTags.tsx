import type { CSSProperties } from 'react';

import { cn } from '@/lib/utils';

import { pokemonTypeColors } from './pokemonTypeColors';

export const PokemonTypeTags = ({
  types,
  large = false,
}: {
  types: Array<string>;
  large?: boolean;
}) => (
  <ul aria-label="Types" className="flex flex-wrap gap-1.5">
    {types.map((type) => {
      const colors = pokemonTypeColors[type];

      return (
        <li
          key={type}
          style={
            colors
              ? ({
                  '--pokemon-type-dark-theme-color': colors.darkThemeColor,
                  '--pokemon-type-white-theme-color': colors.whiteThemeColor,
                  backgroundColor: `color-mix(in srgb, ${colors.whiteThemeColor} 16%, transparent)`,
                } as CSSProperties)
              : undefined
          }
          className={cn(
            'pokemon-type-tag rounded-full border border-(--pokemon-type-white-theme-color) px-1.5 pt-0.5 pb-px text-[11px] leading-none text-(--pokemon-type-white-theme-color) capitalize dark:border-(--pokemon-type-dark-theme-color) dark:text-(--pokemon-type-dark-theme-color) pokedex-game:rounded-none pokedex-game:border-2 pokedex-game:px-1 pokedex-game:py-[3px] pokedex-game:text-[8px]',
            large && 'px-2 text-xs',
          )}
        >
          {type}
        </li>
      );
    })}
  </ul>
);
