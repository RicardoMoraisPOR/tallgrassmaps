import type { ComponentType } from 'react';

import type { Game } from '@/data/games';
import type { Region } from '@/data/maps';

export type ExtraContentProps = {
  game: Game;
  region: Region;
};

export type GameExtra = {
  id: string;
  title: string;
  count: number;
  Content: ComponentType<ExtraContentProps>;
};
