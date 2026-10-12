import { useEffect } from 'react';

import { domMax, LazyMotion, MotionConfig } from 'motion/react';

import { PageTransition } from '@/components/PageTransition';
import { useSettingsStore } from '@/stores/settings';

import { SiteHeader } from './SiteHeader';

export const RootLayout = () => {
  const animations = useSettingsStore((state) => state.animations);

  useEffect(() => {
    document.documentElement.dataset.animations = animations ? 'on' : 'off';
  }, [animations]);

  return (
    <MotionConfig reducedMotion={animations ? 'user' : 'always'}>
      <LazyMotion features={domMax} strict>
        <div className="flex min-h-svh flex-col bg-background text-foreground">
          <SiteHeader />
          <main className="flex flex-1 flex-col">
            <PageTransition depth={1} />
          </main>
        </div>
      </LazyMotion>
    </MotionConfig>
  );
};
