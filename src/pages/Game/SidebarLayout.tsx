import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type SidebarLayoutProps = {
  aside: ReactNode;
  children: ReactNode;
  fitAsideToMain?: boolean;
};

export const SidebarLayout = ({
  aside,
  children,
  fitAsideToMain = false,
}: SidebarLayoutProps) => {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      {children}
      <aside
        className={cn(
          'flex min-w-0 flex-col gap-3',
          fitAsideToMain ? 'lg:relative lg:self-stretch' : 'lg:sticky lg:top-4',
        )}
      >
        {fitAsideToMain ? (
          <div className="flex min-h-0 flex-col gap-3 lg:absolute lg:inset-0 lg:overflow-y-auto">
            {aside}
          </div>
        ) : (
          aside
        )}
      </aside>
    </div>
  );
};
