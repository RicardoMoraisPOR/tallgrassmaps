import {
  type ThemeArea,
  type ThemePreset,
  type ThemeStyle,
  useSettingsStore,
} from '@/stores/settings';

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
    styleLabels: { 'tall-grass': 'Showdown' },
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

export const resolveTheme = (
  area: ThemeArea,
  {
    themePreset,
    themes,
  }: { themePreset: ThemePreset; themes: Record<ThemeArea, ThemeStyle> },
): ThemeStyle => {
  const wanted = themePreset === 'custom' ? themes[area] : themePreset;

  return isThemeAvailable(area, wanted) ? wanted : available[area][0];
};

export const useThemeStyle = (area: ThemeArea) =>
  useSettingsStore((state) => resolveTheme(area, state));
