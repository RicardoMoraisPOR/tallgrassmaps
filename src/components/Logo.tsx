import { SITE_NAME } from '@/data/site';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
  iconClassName?: string;
};

export default function Logo({ className, iconClassName }: LogoProps) {
  return (
    <span className={cn('flex items-center gap-2.5 font-semibold', className)}>
      <img src="/favicon.svg" alt="" className={cn('size-7', iconClassName)} />
      {SITE_NAME}
    </span>
  );
}
