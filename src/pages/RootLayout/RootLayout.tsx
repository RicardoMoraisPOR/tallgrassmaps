import { useEffect } from 'react';

import { domMax, LazyMotion, MotionConfig } from 'motion/react';
import { Link } from 'react-router';

import { Container } from '@/components/Container';
import { Logo } from '@/components/Logo';
import { PageTransition } from '@/components/PageTransition';
import { HeaderMenu } from '@/components/settings/HeaderMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SITE_NAME } from '@/data/site';
import { useSettingsStore } from '@/stores/settings';

export const RootLayout = () => {
  const animations = useSettingsStore((state) => state.animations);

  useEffect(() => {
    document.documentElement.dataset.animations = animations ? 'on' : 'off';
  }, [animations]);

  return (
    <MotionConfig reducedMotion={animations ? 'user' : 'always'}>
      <LazyMotion features={domMax} strict>
        <div className="flex min-h-svh flex-col bg-background text-foreground">
          <header className="border-b">
            <Container className="flex h-14 items-center justify-between gap-3">
              <Link
                to="/"
                aria-label={`${SITE_NAME} home`}
                className="flex min-h-11 items-center rounded-lg outline-offset-2"
              >
                <Logo className="font-heading text-lg tracking-tight" />
              </Link>
              <div className="flex items-center gap-2">
                <HeaderMenu />
                <ThemeToggle />
              </div>
            </Container>
          </header>
          <main className="flex flex-1 flex-col">
            <PageTransition depth={1} />
          </main>
        </div>
      </LazyMotion>
    </MotionConfig>
  );
};
