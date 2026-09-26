import type { MouseEvent } from 'react';

import { ChevronRight } from 'lucide-react';
import { m } from 'motion/react';

import { prefersReducedMotion } from '@/lib/motion';
import { generationId } from '@/lib/paths';

const nudge = {
  rest: { x: 0 },
  hover: { x: 3 },
};

const TARGET_ID = generationId(1);

const scrollToTarget = (event: MouseEvent<HTMLAnchorElement>) => {
  const target =
    document.getElementById(TARGET_ID) ?? document.getElementById('games');

  if (!target) return;

  event.preventDefault();
  target.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start',
  });
};

export const MappingBadge = () => {
  return (
    <m.a
      href={`#${TARGET_ID}`}
      onClick={scrollToTarget}
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileFocus="hover"
      className="inline-flex min-h-8 items-center gap-2 rounded-full border bg-card py-1 pr-3 pl-1.5 text-[13px] leading-5 transition-colors hover:border-ring"
    >
      <span className="inline-flex h-5.5 items-center rounded-full bg-[oklch(0.39_0.08_150)] px-2 text-xs font-semibold text-[oklch(0.9_0.1_145)]">
        New
      </span>
      Red, Blue and Yellow
      <m.span variants={nudge} className="inline-flex">
        <ChevronRight className="size-3.5 text-muted-foreground" />
      </m.span>
    </m.a>
  );
};
