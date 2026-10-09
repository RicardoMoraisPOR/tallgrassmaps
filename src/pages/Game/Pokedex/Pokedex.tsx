import { Suspense, useState } from 'react';

import { useThemeStyle } from '@/components/settings/themes';
import type { Game } from '@/data/games';
import type { Region } from '@/data/maps';
import { pokedexFor } from '@/data/pokedex';

import { defaultPokedexView, pokedexViews } from './pokedexViews';
import { usePokedex } from './usePokedex';
import { usePokedexSearch } from './usePokedexSearch';

type PokedexProps = {
  game: Game;
  region: Region;
  href: (path: string) => string;
};

export const Pokedex = ({ game, region, href }: PokedexProps) => {
  const { open, focus, close } = usePokedex();
  const style = useThemeStyle('pokedex');
  const entries = pokedexFor(region.versionGroup) ?? [];
  const search = usePokedexSearch(entries, game);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);

    if (open) search.reset();
  }

  const view = pokedexViews[region.versionGroup];
  const Content = view?.[style] ?? view?.['tall-grass'] ?? defaultPokedexView;
  const names = new Map(entries.map((entry) => [entry.number, entry.name]));
  const nameOf = (number: number) => names.get(number) ?? `#${number}`;

  if (!Content) return null;

  return (
    <Suspense fallback={null}>
      <Content
        game={game}
        region={region}
        href={href}
        nameOf={nameOf}
        entries={entries}
        open={open}
        focus={focus}
        onClose={close}
        search={search}
      />
    </Suspense>
  );
};
