import { BookOpen } from 'lucide-react';
import { Link } from 'react-router';

import { useGameRoute } from '@/hooks/useGameRoute';
import { cn } from '@/lib/utils';

import { toolbarButtonClass } from '../toolbarButton';
import { hasPokedex } from './pokedexViews';
import { usePokedexLink } from './usePokedex';

export const PokedexButton = () => {
  const route = useGameRoute();
  const pokedexLink = usePokedexLink();

  if (!route) return null;

  const content = (
    <>
      <BookOpen aria-hidden className="size-5 flex-none md:size-4" />
      <span className="hidden text-[13px] font-medium md:inline">Pokédex</span>
    </>
  );

  if (!hasPokedex(route.region))
    return (
      <button
        type="button"
        disabled
        aria-label="Pokédex (coming soon)"
        title="Coming soon"
        className={cn(toolbarButtonClass, 'text-muted-foreground/60')}
      >
        {content}
      </button>
    );

  return (
    <Link
      {...pokedexLink}
      aria-label="Open Pokédex"
      title="Open Pokédex"
      className={cn(toolbarButtonClass, 'text-foreground')}
    >
      {content}
    </Link>
  );
};
