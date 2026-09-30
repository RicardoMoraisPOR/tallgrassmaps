import type { Decorator } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router';

import { SettingsSync } from './SettingsSync';
import { StoryGameProvider } from './StoryGame';

export const withSettings: Decorator = (Story, { globals }) => (
  <StoryGameProvider gameId={String(globals.game ?? 'red')}>
    <SettingsSync style={globals.style} sprites={globals.sprites}>
      <Story />
    </SettingsSync>
  </StoryGameProvider>
);

export const withRouter: Decorator = (Story, { parameters, id }) => (
  <MemoryRouter key={id} initialEntries={[parameters.route ?? '/']}>
    <Story />
  </MemoryRouter>
);
