import '@fontsource/press-start-2p';
import type { Decorator } from '@storybook/react-vite';

import { PokedexStorySurface } from './PokedexStorySurface';

export const withTallGrassSurface: Decorator = (Story) => (
  <PokedexStorySurface>
    <Story />
  </PokedexStorySurface>
);

export const withGameSurface: Decorator = (Story) => (
  <PokedexStorySurface gameTheme>
    <Story />
  </PokedexStorySurface>
);

export const withStyleSurface: Decorator = (Story, { globals }) => (
  <PokedexStorySurface gameTheme={globals.style === 'game'}>
    <Story />
  </PokedexStorySurface>
);
