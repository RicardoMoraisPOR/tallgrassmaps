import { createContext, useContext } from 'react';

export const OpenContext = createContext<() => void>(() => {});

export const useOpenPlaceSearch = () => useContext(OpenContext);

export const searchShortcut = () =>
  typeof navigator !== 'undefined' && /mac/i.test(navigator.platform)
    ? '⌘K'
    : 'Ctrl K';
