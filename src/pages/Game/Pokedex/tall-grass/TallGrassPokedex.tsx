import { ListPokedex } from '../ListPokedex';
import type { PokedexProps } from '../types';
import { tallGrassSkin } from './tallGrassSkin';

export const TallGrassPokedex = (props: PokedexProps) => (
  <ListPokedex skin={tallGrassSkin} {...props} />
);
