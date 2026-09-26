import { type ReactNode, useId, useState } from 'react';

import { ChevronDown } from 'lucide-react';

import { Collapse } from '@/components/Collapse';

type ExpandableCardProps = {
  title: ReactNode;
  children: ReactNode;
};

export const ExpandableCard = ({ title, children }: ExpandableCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const headingId = useId();
  const panelId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col rounded-[14px] border bg-card"
    >
      <h2 id={headingId}>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded((current) => !current)}
          className="group flex w-full items-center justify-between gap-3 rounded-[14px] p-5 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {title}
          <ChevronDown
            aria-hidden
            className="size-4 flex-none transition-transform group-aria-expanded:rotate-180"
          />
        </button>
      </h2>
      <Collapse
        open={expanded}
        id={panelId}
        className="flex flex-col gap-4 px-5 pb-5"
      >
        {children}
      </Collapse>
    </section>
  );
};
