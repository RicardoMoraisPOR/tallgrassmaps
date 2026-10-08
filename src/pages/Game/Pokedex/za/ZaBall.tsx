import { cn } from '@/lib/utils';

type ZaBallProps = {
  caught?: boolean;
  className?: string;
};

export const ZaBall = ({ caught = true, className }: ZaBallProps) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden
    className={cn('size-4 flex-none', className)}
  >
    {caught ? (
      <>
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="#fff"
          stroke="#14213d"
          strokeWidth="2"
        />
        <path d="M2 12a10 10 0 0 1 20 0z" fill="#e4412f" />
        <path d="M2 12h20" stroke="#14213d" strokeWidth="2" />
        <circle
          cx="12"
          cy="12"
          r="3.5"
          fill="#fff"
          stroke="#14213d"
          strokeWidth="2"
        />
      </>
    ) : (
      <circle
        cx="12"
        cy="12"
        r="8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.6"
      />
    )}
  </svg>
);
