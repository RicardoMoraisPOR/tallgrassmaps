import { useEffect, useState } from 'react';

import { Link, NavLink, useLocation } from 'react-router';

import { Logo } from '@/components/Logo';
import { HeaderMenu } from '@/components/settings/HeaderMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SITE_NAME } from '@/data/site';
import { cn } from '@/lib/utils';

import { DevMenu } from './DevMenu';

const HEADER_HEIGHT_PIXELS = 57;
const TOP_THRESHOLD_PIXELS = 8;

const navLinks = [
  { to: '/maps', label: 'Explore maps' },
  { to: '/data-lake', label: 'Data Lake' },
];

const isAtTop = () =>
  Boolean(document.querySelector('[data-hero]')) &&
  window.scrollY < TOP_THRESHOLD_PIXELS;

export const SiteHeader = () => {
  const { pathname } = useLocation();
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setAtTop(isAtTop()));
    };

    update();
    window.addEventListener('scroll', update, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
    };
  }, [pathname]);

  return (
    <>
      <div aria-hidden style={{ height: HEADER_HEIGHT_PIXELS }} />
      <header className="fixed inset-x-0 top-0 z-50">
        <div
          aria-hidden
          className={cn(
            'absolute inset-0 border-b bg-background/85 backdrop-blur-lg transition-opacity duration-250 motion-reduce:transition-none',
            atTop ? 'opacity-0' : 'opacity-100',
          )}
        />
        <div className="relative flex h-14 items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
          <Link
            to="/"
            aria-label={`${SITE_NAME} home`}
            className="flex min-h-11 items-center rounded-lg outline-offset-2"
          >
            <Logo className="font-heading text-lg tracking-tight" />
          </Link>
          <nav
            aria-label="Main"
            className="ml-auto hidden items-center gap-1 sm:flex"
          >
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:text-foreground',
                    isActive ? 'text-foreground' : 'text-muted-foreground',
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {import.meta.env.DEV && <DevMenu />}
            <HeaderMenu />
            <ThemeToggle />
          </div>
        </div>
      </header>
    </>
  );
};
