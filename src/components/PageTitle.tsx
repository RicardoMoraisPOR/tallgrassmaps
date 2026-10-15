import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export const PageTitle = ({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h1
      className={cn(
        'font-heading text-4xl leading-[1.05] font-bold tracking-[-0.035em] sm:text-5xl',
        className,
      )}
      {...props}
    />
  );
};
