import { withSpecies } from '../master';
import type { PokedexData } from '../types';
import data from './rby.json';

export const rbyPokedex = withSpecies(data as Array<PokedexData>);
