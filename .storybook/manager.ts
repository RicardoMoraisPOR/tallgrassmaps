import { GLOBALS_UPDATED, SET_GLOBALS } from 'storybook/internal/core-events';
import { addons } from 'storybook/manager-api';

import { SITE_NAME } from '../src/data/site';
import { systemTheme, type ThemeName, tallGrassThemes } from './tallGrassTheme';

addons.setConfig({ theme: tallGrassThemes[systemTheme()] });

addons.register('tall-grass/theme', (api) => {
  const sync = ({ globals }: { globals: { theme?: ThemeName } }) => {
    api.setOptions({ theme: tallGrassThemes[globals.theme ?? systemTheme()] });
  };

  api.on(SET_GLOBALS, sync);
  api.on(GLOBALS_UPDATED, sync);
});

const renameTab = () => {
  if (document.title.endsWith('Storybook'))
    document.title = document.title.replace(/Storybook$/, SITE_NAME);
};

new MutationObserver(renameTab).observe(document.head, {
  subtree: true,
  childList: true,
  characterData: true,
});
renameTab();
