import type { ReactNode } from 'react';

import { m } from 'motion/react';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { ENTER } from '@/lib/enter';
import { cn } from '@/lib/utils';

type HubHeaderProps = {
  cover?: string;
  title: string;
  children: ReactNode;
};

export const HubHeader = ({ cover, title, children }: HubHeaderProps) => {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <header className="flex flex-col items-center gap-5 sm:flex-row sm:items-end sm:gap-10">
      {cover && (
        <img
          src={cover}
          alt=""
          className={cn(
            'h-auto max-h-32 w-auto max-w-24 flex-none object-contain drop-shadow-[0_6px_14px_oklch(0_0_0/0.35)] sm:max-h-40 sm:max-w-32 lg:max-h-48 lg:max-w-40',
            ENTER,
          )}
        />
      )}
      <div className="flex min-w-0 flex-col items-center gap-3 pb-1 sm:items-start">
        <h1
          className={cn(
            'flex justify-center gap-x-[0.25em] font-heading text-[clamp(1.5rem,8.2vw,3rem)] leading-[0.95] font-bold tracking-[-0.035em] sm:flex-wrap sm:justify-start',
            title.length >= 24
              ? 'sm:text-5xl lg:text-6xl'
              : title.length >= 20
                ? 'sm:text-6xl lg:text-7xl'
                : 'sm:text-7xl lg:text-8xl',
          )}
        >
          {title.split(' ').map((word, index) => (
            <span
              key={index}
              className="-mt-[0.06em] -mb-[0.22em] block overflow-hidden pt-[0.06em] pb-[0.22em] whitespace-nowrap"
            >
              <m.span
                className="block"
                initial={reducedMotion ? false : { y: '110%', rotate: 3 }}
                animate={{ y: 0, rotate: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 0.1 + index * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{ transformOrigin: 'left bottom' }}
              >
                {word}
              </m.span>
            </span>
          ))}
        </h1>
        {children}
      </div>
    </header>
  );
};
