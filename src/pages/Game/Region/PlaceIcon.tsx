import { cn } from '@/lib/utils';

import type { PlaceGroup } from '../places';

export const PlaceIcon = ({
  group,
  className,
}: {
  group: PlaceGroup;
  className?: string;
}) => {
  return (
    <span
      aria-hidden
      className={cn('inline-flex w-3 flex-none justify-center', className)}
    >
      {group === 'route' ? (
        <span className="h-0.5 w-3 bg-current" />
      ) : (
        <span
          className={cn(
            'size-2.5 border-2 border-current',
            group === 'landmark' && 'rounded-full',
          )}
        />
      )}
    </span>
  );
};
