import { zaPokedex } from '@/data/pokedex/za';

import type { PokedexContentProps } from '../pokedexViews';
import { PokedexList } from '../PokedexList';

export const ZaPokedex = (props: PokedexContentProps) => (
  <PokedexList {...props} entries={zaPokedex} />
);
