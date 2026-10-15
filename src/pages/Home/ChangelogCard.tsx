import { ArrowUpRight } from 'lucide-react';
import { m } from 'motion/react';
import { Link } from 'react-router';

import { latestChangelog } from '@/data/changelog';

const dateFormat = new Intl.DateTimeFormat('en', { dateStyle: 'medium' });

const nudge = {
  rest: { x: 0, y: 0 },
  hover: { x: 2, y: -2 },
};

const MotionLink = m.create(Link);

export const ChangelogCard = () => {
  return (
    <MotionLink
      to="/changelog"
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileFocus="hover"
      className="flex w-full items-center gap-3 rounded-lg border bg-card px-3 py-2 text-left transition-colors hover:border-ring"
    >
      <span className="flex-1 text-sm font-medium">Changelog</span>
      <time
        dateTime={latestChangelog.date}
        className="shrink-0 text-xs text-muted-foreground"
      >
        {dateFormat.format(new Date(`${latestChangelog.date}T00:00:00`))}
      </time>
      <m.span variants={nudge} className="inline-flex shrink-0">
        <ArrowUpRight className="size-3.5 text-muted-foreground" />
      </m.span>
    </MotionLink>
  );
};
