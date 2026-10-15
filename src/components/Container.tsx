import type { HTMLAttributes, Ref } from 'react';

import { cn } from '@/lib/utils';

const sizes = {
  narrow: 'max-w-3xl',
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
  full: 'max-w-[88rem]',
};

type ContainerProps = HTMLAttributes<HTMLElement> & {
  as?: 'div' | 'section';
  size?: keyof typeof sizes;
  ref?: Ref<HTMLDivElement>;
};

export const Container = ({
  as: Tag = 'div',
  size = 'default',
  className,
  ...props
}: ContainerProps) => {
  return (
    <Tag
      className={cn('mx-auto w-full px-4', sizes[size], className)}
      {...props}
    />
  );
};
