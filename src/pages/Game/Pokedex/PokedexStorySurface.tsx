import type { ReactNode } from 'react';

import { Drawer } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

type PokedexStorySurfaceProps = {
  surfaceClassName?: string;
  children: ReactNode;
};

export const PokedexStorySurface = ({
  surfaceClassName,
  children,
}: PokedexStorySurfaceProps) => (
  <Drawer>
    <div
      className={cn(
        'max-h-[85svh] w-md max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border bg-popover p-4 text-sm text-popover-foreground',
        surfaceClassName,
      )}
    >
      {children}
    </div>
  </Drawer>
);
