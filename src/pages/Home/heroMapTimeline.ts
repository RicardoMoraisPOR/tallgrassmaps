import { cubicBezier } from 'motion/react';

import { easeOutSoft } from '@/lib/motion';

export const EXPLODE_SECONDS = 1.2;
export const COLLAPSE_SECONDS = 0.9;
export const INTRO_EXPLODE_SECONDS = 2.7;
export const MAP_SWAP_IN_SECONDS = 0.6;
export const MAP_SWAP_OUT_SECONDS = 0.2;

export const timelineEase = cubicBezier(...easeOutSoft);

export const STAGE_RANGE: [number, number] = [0, 0.45];
export const SLAB_RANGE: [number, number] = [0.45, 1];

export const LAYER_START = 0.45;
const LAYER_STAGGER = 0.08;
const LAYER_LENGTH = 0.3;

export const layerRange = (index: number): [number, number] => {
  const start = LAYER_START + index * LAYER_STAGGER;

  return [start, start + LAYER_LENGTH];
};
