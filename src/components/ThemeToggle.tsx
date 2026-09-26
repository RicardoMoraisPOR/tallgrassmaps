import { useRef, useState } from 'react';

import { Moon, Sun } from 'lucide-react';
import { flushSync } from 'react-dom';

import { Button } from '@/components/ui/button';
import { prefersReducedMotion } from '@/lib/motion';
import { getTheme, setTheme, type Theme } from '@/lib/theme';

const REVEAL_MS = 500;

export const ThemeToggle = () => {
  const [theme, setThemeState] = useState<Theme>(getTheme);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const next = theme === 'dark' ? 'light' : 'dark';

  const apply = () => {
    setTheme(next);
    setThemeState(next);
  };

  const toggle = async () => {
    const button = buttonRef.current;

    if (!button || !document.startViewTransition || prefersReducedMotion()) {
      apply();

      return;
    }

    await document.startViewTransition(() => flushSync(apply)).ready;

    const { top, left, width, height } = button.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: REVEAL_MS,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)',
      },
    );
  };

  return (
    <Button
      ref={buttonRef}
      variant="outline"
      size="icon"
      aria-label={`Switch to ${next} mode`}
      className="relative size-11 sm:size-9"
      onClick={toggle}
    >
      <Sun className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </Button>
  );
};
