import { useContext } from 'react';

import { useParams } from 'react-router';

import { getGame } from '@/data/games';
import { getRegion } from '@/data/maps';
import {
  type ThemeArea,
  type ThemePreset,
  type ThemeStyle,
  useSettingsStore,
} from '@/stores/settings';

import {
  ThemeOverrideContext,
  ThemeVersionGroupContext,
} from './themeOverride';

export const themeAreas: Array<{
  area: ThemeArea;
  label: string;
  description: string;
  styleLabels?: Partial<Record<ThemeStyle, string>>;
}> = [
  { area: 'pokedex', label: 'Pokédex', description: 'The Pokédex drawer.' },
  {
    area: 'mapIcons',
    label: 'Map icons',
    description: 'Markers on the maps.',
  },
  {
    area: 'dialogBoxes',
    label: 'Dialog boxes',
    description: 'Text boxes from people, signs and items.',
  },
  {
    area: 'trainers',
    label: 'Trainers',
    description: 'Trainer cards and battle dialogs.',
  },
  {
    area: 'pokemonPopups',
    label: 'Pokémon popups',
    description: 'Wild, static and gift Pokémon popups.',
  },
  {
    area: 'sprites',
    label: 'Pokémon sprites',
    description: 'Pokémon artwork across the site.',
    styleLabels: { 'tall-grass': 'PokeAPI' },
  },
];

export const themeStyles: Array<{ style: ThemeStyle; label: string }> = [
  { style: 'tall-grass', label: 'Tall Grass' },
  { style: 'game', label: 'Game' },
];

export const themePresets: Array<{ preset: ThemePreset; label: string }> = [
  { preset: 'tall-grass', label: 'Tall Grass' },
  { preset: 'game', label: 'Games Theme' },
  { preset: 'custom', label: 'Custom' },
];

const available: Record<ThemeArea, Array<ThemeStyle>> = {
  pokedex: ['tall-grass', 'game'],
  mapIcons: ['game', 'tall-grass'],
  dialogBoxes: ['game', 'tall-grass'],
  trainers: ['game', 'tall-grass'],
  pokemonPopups: ['game', 'tall-grass'],
  sprites: ['tall-grass', 'game'],
};

export const isThemeAvailable = (area: ThemeArea, style: ThemeStyle) =>
  available[area].includes(style);

const gameThemes: Partial<Record<string, ReadonlyArray<ThemeArea>>> = {
  RBY: [
    'pokedex',
    'mapIcons',
    'dialogBoxes',
    'trainers',
    'pokemonPopups',
    'sprites',
  ],
  ZA: [
    'pokedex',
    'mapIcons',
    'dialogBoxes',
    'trainers',
    'pokemonPopups',
    'sprites',
  ],
};

const hasGameTheme = (area: ThemeArea, versionGroup: string | undefined) =>
  area === 'sprites' ||
  versionGroup === undefined ||
  !!gameThemes[versionGroup]?.includes(area);

export const resolveTheme = (
  area: ThemeArea,
  {
    themePreset,
    themes,
  }: { themePreset: ThemePreset; themes: Record<ThemeArea, ThemeStyle> },
  versionGroup?: string,
): ThemeStyle => {
  const wanted = themePreset === 'custom' ? themes[area] : themePreset;
  const style = isThemeAvailable(area, wanted) ? wanted : available[area][0];

  return style === 'game' && !hasGameTheme(area, versionGroup)
    ? 'tall-grass'
    : style;
};

const useVersionGroup = () => {
  const override = useContext(ThemeVersionGroupContext);
  const { gameId } = useParams();
  const game = getGame(gameId);

  return override ?? (game && getRegion(game.region)?.versionGroup);
};

export const useThemeStyle = (area: ThemeArea) => {
  const override = useContext(ThemeOverrideContext);
  const versionGroup = useVersionGroup();

  return useSettingsStore(
    (state) => override ?? resolveTheme(area, state, versionGroup),
  );
};

export type ThemeSkin = 'tall-grass' | 'rby' | 'za';

export const useThemeSkin = (area: ThemeArea): ThemeSkin => {
  const style = useThemeStyle(area);
  const versionGroup = useVersionGroup();

  if (style !== 'game') return 'tall-grass';

  return versionGroup === 'ZA' ? 'za' : 'rby';
};
