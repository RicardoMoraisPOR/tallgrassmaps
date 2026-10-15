import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type OverlayPillProps = {
  children: ReactNode;
  className?: string;
  title?: string;
};

export const OverlayPill = ({
  children,
  className,
  title,
}: OverlayPillProps) => {
  return (
    <span
      title={title}
      className={cn(
        'absolute bottom-2.5 inline-flex h-6 items-center gap-1.5 rounded-full bg-[oklch(0.145_0_0/0.72)] px-2 text-xs font-medium text-[oklch(0.985_0_0)]',
        className,
      )}
    >
      {children}
    </span>
  );
};
