import { createContext } from 'react';

import type { ThemeStyle } from '@/stores/settings';

export const ThemeOverrideContext = createContext<ThemeStyle | undefined>(
  undefined,
);
