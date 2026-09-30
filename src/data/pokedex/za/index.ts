import { withSpecies } from '../master';
import type { PokedexData } from '../types';
import data from './za.json';

export const zaPokedex = withSpecies(data as Array<PokedexData>);
