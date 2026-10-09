import type { Platform } from '../games';
import type { CatalogEntry } from './types';

export const catalogColors = {
  yellow: 'oklch(0.86 0.16 92)',
  gold: 'oklch(0.76 0.12 85)',
  silver: 'oklch(0.78 0.01 250)',
  crystal: 'oklch(0.78 0.09 220)',
  ruby: 'oklch(0.52 0.2 20)',
  sapphire: 'oklch(0.48 0.16 265)',
  emerald: 'oklch(0.62 0.15 155)',
  fire: 'oklch(0.64 0.2 38)',
  leaf: 'oklch(0.66 0.17 140)',
  diamond: 'oklch(0.72 0.1 250)',
  pearl: 'oklch(0.8 0.07 350)',
  platinum: 'oklch(0.7 0.02 260)',
  black: 'oklch(0.25 0 0)',
  white: 'oklch(0.95 0 0)',
  x: 'oklch(0.5 0.15 255)',
  y: 'oklch(0.55 0.2 25)',
  sun: 'oklch(0.72 0.17 60)',
  moon: 'oklch(0.5 0.15 300)',
  ultraSun: 'oklch(0.7 0.18 50)',
  ultraMoon: 'oklch(0.45 0.18 290)',
  eevee: 'oklch(0.65 0.1 60)',
  sword: 'oklch(0.6 0.13 230)',
  shield: 'oklch(0.55 0.18 10)',
  arceus: 'oklch(0.75 0.08 90)',
  scarlet: 'oklch(0.6 0.22 25)',
  violet: 'oklch(0.5 0.2 305)',
};

export const soon = (
  versionGroup: string,
  platform: Platform,
  regions: Array<string>,
  titles: Array<[id: string, title: string, color: string]>,
): Array<CatalogEntry> =>
  titles.map(([id, title, color]) => ({
    id,
    title,
    status: 'coming-soon',
    regions,
    platform,
    versionGroup,
    colors: [color],
  }));
