import { create } from 'storybook/theming';

import { SITE_NAME } from '../src/data/site';

export type ThemeName = 'light' | 'dark';

const brandTitle = `<span style="display:flex;align-items:center;gap:10px;font-weight:600;font-size:16px;letter-spacing:-0.01em"><img src="./favicon.svg" alt="" width="28" height="28" />${SITE_NAME}</span>`;

const shared = {
  brandTitle,
  brandUrl: './',
  brandTarget: '_self',
  fontBase: "'Geist Variable', ui-sans-serif, system-ui, sans-serif",
  fontCode: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  appBorderRadius: 10,
  inputBorderRadius: 10,
};

export const tallGrassThemes = {
  light: create({
    ...shared,
    base: 'light',
    colorPrimary: '#1f5130',
    colorSecondary: '#2f7a47',
    appBg: '#fafafa',
    appContentBg: '#ffffff',
    appPreviewBg: '#ffffff',
    appBorderColor: '#e5e5e5',
    textColor: '#0a0a0a',
    textMutedColor: '#737373',
    barBg: '#ffffff',
    barTextColor: '#737373',
    barSelectedColor: '#2f7a47',
    inputBg: '#ffffff',
    inputBorder: '#e5e5e5',
    inputTextColor: '#0a0a0a',
  }),
  dark: create({
    ...shared,
    base: 'dark',
    colorPrimary: '#6cc36c',
    colorSecondary: '#2f7a47',
    appBg: '#171717',
    appContentBg: '#0a0a0a',
    appPreviewBg: '#0a0a0a',
    appBorderColor: '#262626',
    textColor: '#fafafa',
    textMutedColor: '#a1a1a1',
    barBg: '#171717',
    barTextColor: '#a1a1a1',
    barSelectedColor: '#6cc36c',
    inputBg: '#262626',
    inputBorder: '#333333',
    inputTextColor: '#fafafa',
  }),
};

export const systemTheme = (): ThemeName =>
  matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
