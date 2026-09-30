import type { Decorator } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router';

import { SettingsSync } from './SettingsSync';

export const withSettings: Decorator = (Story, { globals }) => (
  <SettingsSync style={globals.style} sprites={globals.sprites}>
    <Story />
  </SettingsSync>
);

export const withRouter: Decorator = (Story, { parameters, id }) => (
  <MemoryRouter key={id} initialEntries={[parameters.route ?? '/']}>
    <Story />
  </MemoryRouter>
);
