import type { ThemeArea, ThemeStyle } from '@/stores/settings';

export const themeAreas: Array<{ area: ThemeArea; label: string }> = [
  { area: 'pokedex', label: 'Pokédex' },
  { area: 'townMap', label: 'Town Map' },
  { area: 'sprites', label: 'Pokémon sprites' },
];

export const themeStyles: Array<{ style: ThemeStyle; label: string }> = [
  { style: 'game', label: 'Game' },
  { style: 'tall-grass', label: 'Tall Grass' },
];

const available: Record<ThemeArea, Array<ThemeStyle>> = {
  pokedex: ['tall-grass'],
  townMap: ['game'],
  sprites: ['tall-grass'],
};

export const isThemeAvailable = (area: ThemeArea, style: ThemeStyle) =>
  available[area].includes(style);

export const resolveTheme = (
  area: ThemeArea,
  {
    useGameThemes,
    themes,
  }: { useGameThemes: boolean; themes: Record<ThemeArea, ThemeStyle> },
): ThemeStyle => {
  const wanted = useGameThemes ? 'game' : themes[area];

  return isThemeAvailable(area, wanted) ? wanted : available[area][0];
};
