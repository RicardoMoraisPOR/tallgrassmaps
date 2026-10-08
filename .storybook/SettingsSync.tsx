import { type ReactNode, useLayoutEffect } from 'react';

import { type ThemeStyle, useSettingsStore } from '../src/stores/settings';

type SettingsSyncProps = {
  style: ThemeStyle;
  sprites: ThemeStyle;
  children: ReactNode;
};

export const SettingsSync = ({
  style,
  sprites,
  children,
}: SettingsSyncProps) => {
  const synced = useSettingsStore(
    ({ themePreset, themes }) =>
      themePreset === 'custom' &&
      themes.pokedex === style &&
      themes.sprites === sprites,
  );

  useLayoutEffect(() => {
    useSettingsStore.setState({
      themePreset: 'custom',
      themes: {
        pokedex: style,
        mapIcons: style,
        dialogBoxes: style,
        trainers: style,
        pokemonPopups: style,
        sprites,
      },
    });
  }, [style, sprites]);

  return synced ? children : null;
};
