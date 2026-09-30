import { withThemeByClassName } from '@storybook/addon-themes';
import type { Preview } from '@storybook/react-vite';

import '../src/index.css';
import { withRouter, withSettings } from './decorators';
import { systemTheme } from './tallGrassTheme';

const preview: Preview = {
  globalTypes: {
    style: {
      description: 'Tall Grass or Game style',
      toolbar: {
        title: 'Style',
        icon: 'component',
        items: [
          { value: 'tall-grass', title: 'Tall Grass' },
          { value: 'game', title: 'Game' },
        ],
        dynamicTitle: true,
      },
    },
    sprites: {
      description: 'Pokémon sprites',
      toolbar: {
        title: 'Sprites',
        icon: 'photo',
        items: [
          { value: 'tall-grass', title: 'Showdown sprites' },
          { value: 'game', title: 'Game sprites' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    style: 'game',
    sprites: 'tall-grass',
  },
  decorators: [
    withRouter,
    withSettings,
    withThemeByClassName({
      themes: { light: '', dark: 'dark' },
      defaultTheme: systemTheme(),
    }),
  ],
  parameters: {
    layout: 'centered',
  },
};

export default preview;
