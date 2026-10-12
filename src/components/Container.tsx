import type { HTMLAttributes, Ref } from 'react';

import { cn } from '@/lib/utils';

type ContainerProps = HTMLAttributes<HTMLElement> & {
  as?: 'div' | 'section';
  ref?: Ref<HTMLDivElement>;
};

export const Container = ({
  as: Tag = 'div',
  className,
  ...props
}: ContainerProps) => {
  return (
    <Tag
      className={cn('mx-auto w-full max-w-6xl px-4', className)}
      {...props}
    />
  );
};
