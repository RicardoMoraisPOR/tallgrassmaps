export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'tall-grass-theme';

export const getTheme = (): Theme =>
  document.documentElement.classList.contains('dark') ? 'dark' : 'light';

export const setTheme = (theme: Theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {}
};
