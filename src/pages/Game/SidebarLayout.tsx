import type { ReactNode } from 'react';

type SidebarLayoutProps = {
  aside: ReactNode;
  children: ReactNode;
};

export const SidebarLayout = ({ aside, children }: SidebarLayoutProps) => {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      {children}
      <aside className="flex min-w-0 flex-col gap-3 lg:sticky lg:top-4">
        {aside}
      </aside>
    </div>
  );
};
