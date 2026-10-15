export const PLATFORM_SIZE = 280;
export const PLATFORM_LAYERS = 14;
export const LAYER_GAP = 2;
export const SCENE_WIDTH = 450;
export const SCENE_HEIGHT = 420;
export const TOP_Z = (PLATFORM_LAYERS - 1) * LAYER_GAP + 1;
export const MAP_SPRITE_SCALE = 0.51;
export const GLOW = 'rgb(108 196 106 / 0.65)';
export const BASE_TILT_X = 58;
export const BASE_TILT_Z = -45;

export const COLORS = {
  dark: '#1f5130',
  mid: '#3f9150',
  light: '#6cc46a',
};

const BACK_INSET = 26;
const FRONT_INSET = 72;

export const WALK_BOUNDS = {
  minX: FRONT_INSET,
  maxX: PLATFORM_SIZE - BACK_INSET,
  minY: BACK_INSET,
  maxY: PLATFORM_SIZE - FRONT_INSET,
};

export const random = (min: number, max: number) =>
  min + Math.random() * (max - min);

export const seeded = (seed: number) => {
  let state = seed;

  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;

    return state / 4294967296;
  };
};

export const isTouchDevice = () =>
  window.matchMedia('(hover: none), (pointer: coarse)').matches;
