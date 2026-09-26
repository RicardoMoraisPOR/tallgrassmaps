import type { ReactNode } from 'react';

import { AnimatePresence, m, useReducedMotionConfig } from 'motion/react';

import { easeOutSoft } from '@/lib/motion';

export const Collapse = ({
  open,
  id,
  className,
  children,
}: {
  open: boolean;
  id?: string;
  className?: string;
  children: ReactNode;
}) => {
  const reducedMotion = useReducedMotionConfig();

  return (
    <AnimatePresence initial={false}>
      {open && (
        <m.div
          id={id}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.18, ease: easeOutSoft }}
          className="overflow-hidden"
        >
          <div className={className}>{children}</div>
        </m.div>
      )}
    </AnimatePresence>
  );
};
