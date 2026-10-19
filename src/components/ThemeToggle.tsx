import { useRef, useState } from 'react';

import { Moon, Sun } from 'lucide-react';
import { flushSync } from 'react-dom';

import { Button } from '@/components/ui/button';
import { prefersReducedMotion } from '@/lib/media';
import { getTheme, setTheme, type Theme } from '@/lib/theme';

import { playEncounterTransition } from './encounterTransition';

export const ThemeToggle = () => {
  const [theme, setThemeState] = useState<Theme>(getTheme);
  const busy = useRef(false);

  const next = theme === 'dark' ? 'light' : 'dark';

  const apply = () => {
    setTheme(next);
    setThemeState(next);
  };

  const toggle = async () => {
    if (busy.current) return;

    if (prefersReducedMotion()) {
      apply();

      return;
    }

    busy.current = true;

    try {
      await playEncounterTransition({ swap: () => flushSync(apply) });
    } finally {
      busy.current = false;
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={`Switch to ${next} mode`}
      className="relative size-11 sm:size-9"
      onClick={toggle}
    >
      <Sun className="scale-100 rotate-0 opacity-100 transition-all duration-200 ease-out dark:scale-90 dark:-rotate-90 dark:opacity-0" />
      <Moon className="absolute scale-90 rotate-90 opacity-0 transition-all duration-200 ease-out dark:scale-100 dark:rotate-0 dark:opacity-100" />
    </Button>
  );
};
