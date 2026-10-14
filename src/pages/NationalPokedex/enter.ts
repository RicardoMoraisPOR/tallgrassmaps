import type { CSSProperties } from 'react';

export const FIRST_RENDER =
  'motion-safe:animate-in motion-safe:fade-in-50 motion-safe:slide-in-from-bottom-1 duration-300 ease-out fill-mode-backwards';

export const HOVER_TINT =
  'transition-colors duration-150 motion-reduce:transition-none';

const MAX_STAGGERED = 24;
const STAGGER_MS = 8;

export const stagger = (index: number): CSSProperties => ({
  animationDelay: `${Math.min(index, MAX_STAGGERED) * STAGGER_MS}ms`,
});
