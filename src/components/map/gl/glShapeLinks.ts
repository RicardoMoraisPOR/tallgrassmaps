import type { MapLink } from '../viewer/types';

export const isShape = (link: MapLink) =>
  !link.icon && !link.sprite && !link.badge;
