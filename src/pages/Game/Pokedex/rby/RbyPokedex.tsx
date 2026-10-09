import { ListPokedex } from '../ListPokedex';
import type { PokedexProps } from '../types';
import { rbySkin } from './rbySkin';

export const RbyPokedex = (props: PokedexProps) => (
  <ListPokedex skin={rbySkin} {...props} />
);
