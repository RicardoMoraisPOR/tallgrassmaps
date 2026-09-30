import data from './rby.json';
import type { StaticPokemon } from './types';

const SPRITES = '/sprites/rby/overworld';

export const rbyStaticPokemon = (data as Array<StaticPokemon>).map((marker) =>
  marker.sprite
    ? { ...marker, sprite: `${SPRITES}/${marker.sprite}.png` }
    : marker,
);
