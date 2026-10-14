import type { CSSProperties } from 'react';

import { pokemonTypeColors } from '../Game/Pokedex/pokemonTypeColors';

export const TYPE_TINT =
  "relative isolate before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-[linear-gradient(135deg,color-mix(in_srgb,var(--tint-a-light)_6%,transparent),color-mix(in_srgb,var(--tint-b-light)_6%,transparent))] before:opacity-0 before:transition-opacity before:duration-150 before:content-[''] hover:border-[color-mix(in_srgb,color-mix(in_srgb,var(--tint-a-light),var(--tint-b-light))_45%,transparent)] hover:before:opacity-100 focus-visible:before:opacity-100 motion-reduce:before:transition-none dark:hover:border-[color-mix(in_srgb,color-mix(in_srgb,var(--tint-a-dark),var(--tint-b-dark))_55%,transparent)] dark:before:bg-[linear-gradient(135deg,color-mix(in_srgb,var(--tint-a-dark)_9%,transparent),color-mix(in_srgb,var(--tint-b-dark)_9%,transparent))]";

export const SELECTED_TINT =
  'border-[color-mix(in_srgb,color-mix(in_srgb,var(--tint-a-light),var(--tint-b-light))_55%,transparent)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--tint-a-light)_16%,transparent),color-mix(in_srgb,var(--tint-b-light)_16%,transparent))] dark:border-[color-mix(in_srgb,color-mix(in_srgb,var(--tint-a-dark),var(--tint-b-dark))_65%,transparent)] dark:bg-[linear-gradient(135deg,color-mix(in_srgb,var(--tint-a-dark)_22%,transparent),color-mix(in_srgb,var(--tint-b-dark)_22%,transparent))]';

export const typeTintStyle = (types: Array<string>): CSSProperties => {
  const first = pokemonTypeColors[types[0]];
  const second = pokemonTypeColors[types[1] ?? types[0]] ?? first;

  if (!first) return {};

  return {
    '--tint-a-light': first.whiteThemeColor,
    '--tint-a-dark': first.darkThemeColor,
    '--tint-b-light': second.whiteThemeColor,
    '--tint-b-dark': second.darkThemeColor,
  } as CSSProperties;
};
