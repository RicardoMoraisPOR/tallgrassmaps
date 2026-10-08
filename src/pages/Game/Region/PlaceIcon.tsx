import type { PlaceIconShape } from '@/data/maps';
import { cn } from '@/lib/utils';

export const PlaceIcon = ({
  shape,
  className,
}: {
  shape: PlaceIconShape;
  className?: string;
}) => {
  return (
    <span
      aria-hidden
      className={cn('inline-flex w-3 flex-none justify-center', className)}
    >
      {shape === 'line' ? (
        <span className="h-0.5 w-3 bg-current" />
      ) : (
        <span
          className={cn(
            'border-2 border-current',
            shape === 'diamond' ? 'size-2 rotate-45' : 'size-2.5',
            shape === 'circle' && 'rounded-full',
          )}
        />
      )}
    </span>
  );
};
