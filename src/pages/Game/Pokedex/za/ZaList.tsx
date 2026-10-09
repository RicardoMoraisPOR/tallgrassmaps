import { PokedexList } from '../ListPokedex';
import type { PokedexListProps } from '../types';
import { ZaRow } from './ZaRow';

export const ZaList = (props: PokedexListProps) => (
  <PokedexList
    {...props}
    Row={ZaRow}
    className="grid grid-cols-[repeat(auto-fill,minmax(4.5rem,1fr))] gap-2.5 px-4 pt-3 pb-6"
    emptyClassName="py-8 text-center text-base text-white/70"
  />
);
