import { useState } from 'react';

import { ChevronRight } from 'lucide-react';
import { m } from 'motion/react';

import { latestChangelog } from '@/data/changelog';

import { ChangelogDialog } from './ChangelogDialog';

const nudge = {
  rest: { x: 0 },
  hover: { x: 3 },
};

export const ChangelogBadge = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <m.button
        type="button"
        onClick={() => setOpen(true)}
        initial="rest"
        animate="rest"
        whileHover="hover"
        whileFocus="hover"
        aria-haspopup="dialog"
        className="inline-flex min-h-8 items-center gap-2 rounded-full border bg-card py-1 pr-3 pl-1.5 text-[13px] leading-5 transition-colors hover:border-ring"
      >
        <span className="inline-flex h-5.5 items-center rounded-full bg-[oklch(0.39_0.08_150)] px-2 text-xs font-semibold text-[oklch(0.9_0.1_145)]">
          v{latestChangelog.version}
        </span>
        See what&apos;s new
        <m.span variants={nudge} className="inline-flex">
          <ChevronRight className="size-3.5 text-muted-foreground" />
        </m.span>
      </m.button>
      <ChangelogDialog open={open} onOpenChange={setOpen} />
    </>
  );
};
