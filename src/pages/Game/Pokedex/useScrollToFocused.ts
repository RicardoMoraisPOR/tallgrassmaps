import { useEffect, useRef } from 'react';

export const useScrollToFocused = (focused: boolean) => {
  const rowRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const row = rowRef.current;

    if (!focused || !row) return;

    let cancelled = false;

    const scroll = () => {
      const header = row
        .closest('[role="dialog"]')
        ?.querySelector<HTMLElement>('[data-pokedex-header]');

      row.style.scrollMarginTop = `${header?.offsetHeight ?? 0}px`;
      row.scrollIntoView({ block: 'start' });
    };

    scroll();
    void document.fonts.ready.then(() => {
      if (!cancelled) scroll();
    });

    return () => {
      cancelled = true;
    };
  }, [focused]);

  return rowRef;
};
