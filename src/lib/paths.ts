import type { Location } from '@/data/maps';

export const pathSegments = (path: string) => path.split('/').filter(Boolean);

export const joinPath = (...segments: Array<string>) =>
  segments.filter(Boolean).join('/');

export const trailPath = (trail: Array<Location>) =>
  joinPath(...trail.map(({ id }) => id));

export const generationId = (generation: number) => `gen-${generation}`;

export const generationHref = (generation: number) =>
  `/#${generationId(generation)}`;

export const gameHref = (gameId: string) => `/${gameId}`;

export const locationHref = (gameId: string, path: string) =>
  `/${joinPath(gameId, path)}`;
