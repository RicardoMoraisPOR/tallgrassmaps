import type { MapLink } from './types';

export const spriteKey = (link: MapLink) => `${link.x},${link.y}`;

export const linkKey = (link: MapLink) =>
  `${link.href ?? link.label}@${link.x},${link.y}`;
