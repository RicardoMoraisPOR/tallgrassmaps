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
    ({ themes }) => themes.pokedex === style && themes.sprites === sprites,
  );

  useLayoutEffect(() => {
    useSettingsStore.setState({
      themes: {
        pokedex: style,
        townMap: style,
        trainers: style,
        wildPokemon: style,
        sprites,
      },
    });
  }, [style, sprites]);

  return synced ? children : null;
};
