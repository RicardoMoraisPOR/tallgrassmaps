import type { CSSProperties } from 'react';

export const ENTER =
  'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 duration-300 ease-out fill-mode-backwards';

export const enterDelay = (seconds: number): CSSProperties => ({
  animationDelay: `${seconds}s`,
});
