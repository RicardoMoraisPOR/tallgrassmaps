import { withThemeByClassName } from '@storybook/addon-themes';
import type { Preview } from '@storybook/react-vite';

import '../src/index.css';
import { games } from '../src/data/games';
import { withRouter, withSettings } from './decorators';
import { systemTheme } from './tallGrassTheme';

const preview: Preview = {
  globalTypes: {
    style: {
      description: 'Tall Grass or Game Themes',
      toolbar: {
        title: 'Style',
        icon: 'component',
        items: [
          { value: 'tall-grass', title: 'Tall Grass Theme' },
          { value: 'game', title: 'Game Theme' },
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
          { value: 'tall-grass', title: 'Showdown Pokémon Sprites' },
          { value: 'game', title: 'Game Pokémon Sprites' },
        ],
        dynamicTitle: true,
      },
    },
    game: {
      description: 'Game data used by stories',
      toolbar: {
        title: 'Game',
        icon: 'play',
        items: games.map(({ id, fullName }) => ({
          value: id,
          title: fullName,
        })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    style: 'game',
    sprites: 'tall-grass',
    game: 'red',
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
