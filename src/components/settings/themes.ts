import {
  type ThemeArea,
  type ThemeStyle,
  useSettingsStore,
} from '@/stores/settings';

export const themeAreas: Array<{
  area: ThemeArea;
  label: string;
  styleLabels?: Partial<Record<ThemeStyle, string>>;
}> = [
  { area: 'pokedex', label: 'Pokédex' },
  { area: 'townMap', label: 'Town Map' },
  {
    area: 'sprites',
    label: 'Pokémon sprites',
    styleLabels: { 'tall-grass': 'Showdown' },
  },
];

export const themeStyles: Array<{ style: ThemeStyle; label: string }> = [
  { style: 'game', label: 'Game' },
  { style: 'tall-grass', label: 'Tall Grass' },
];

const available: Record<ThemeArea, Array<ThemeStyle>> = {
  pokedex: ['tall-grass', 'game'],
  townMap: ['game', 'tall-grass'],
  sprites: ['tall-grass', 'game'],
};

export const isThemeAvailable = (area: ThemeArea, style: ThemeStyle) =>
  available[area].includes(style);

export const resolveTheme = (
  area: ThemeArea,
  { themes }: { themes: Record<ThemeArea, ThemeStyle> },
): ThemeStyle => {
  const wanted = themes[area];

  return isThemeAvailable(area, wanted) ? wanted : available[area][0];
};

export const useThemeStyle = (area: ThemeArea) =>
  useSettingsStore((state) => resolveTheme(area, state));
