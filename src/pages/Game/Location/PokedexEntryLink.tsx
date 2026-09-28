import type { ComponentProps } from 'react';

import { Link } from 'react-router';

import { cn } from '@/lib/utils';

import { usePokedexLink } from '../Pokedex/usePokedex';

export const PokedexEntryLink = ({
  number,
  className,
  ...props
}: Omit<ComponentProps<typeof Link>, 'to'> & { number: number }) => {
  const pokedexLink = usePokedexLink(number);

  return (
    <Link
      {...pokedexLink}
      {...props}
      className={cn(
        'self-start rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 pokedex-game:pb-1 pokedex-game:decoration-2 pokedex-game:underline-offset-2',
        className,
      )}
    />
  );
};
