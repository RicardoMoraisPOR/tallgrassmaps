import { rbyPokedex } from '@/data/pokedex/rby';

import type { PokedexContentProps } from '../pokedexViews';
import { PokedexList } from '../PokedexList';

export const RbyPokedex = (props: PokedexContentProps) => (
  <PokedexList {...props} entries={rbyPokedex} versionFilters />
);
