import { Maximize2, Minimize2 } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';

import { useMapLayout } from '@/hooks/useMapLayout';
import { useSettingsStore } from '@/stores/settings';

import { captureMapFrame } from './mapFrame';

export const LayoutToggle = ({ versionGroup }: { versionGroup: string }) => {
  const layout = useMapLayout(versionGroup);
  const setLayout = useSettingsStore((state) => state.setLayout);
  const animations = useSettingsStore((state) => state.animations);
  const immersive = layout === 'immersive';
  const label = immersive
    ? 'Switch to minimalist layout'
    : 'Switch to immersive layout';
  const Icon = immersive ? Minimize2 : Maximize2;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => {
        captureMapFrame();
        setLayout(versionGroup, immersive ? 'minimalist' : 'immersive');
      }}
      className="absolute top-4 right-4 z-30 flex size-9 items-center justify-center rounded-[14px] border bg-card text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={layout}
          initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
          transition={{ duration: animations ? 0.15 : 0 }}
          className="flex"
        >
          <Icon aria-hidden className="size-4" />
        </m.span>
      </AnimatePresence>
    </button>
  );
};
