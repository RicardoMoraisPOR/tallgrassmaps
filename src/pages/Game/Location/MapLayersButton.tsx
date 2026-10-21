import { useState } from 'react';

import { Layers } from 'lucide-react';

import { cn } from '@/lib/utils';

import { toolbarButtonClass } from '../toolbarButton';
import { MapSettingsDialog } from './MapSettingsDialog';

export const MapLayersButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label="Map layers"
        title="Map layers"
        onClick={() => setOpen(true)}
        className={cn(toolbarButtonClass, 'text-foreground')}
      >
        <Layers aria-hidden className="size-5 flex-none md:size-4" />
        <span className="hidden text-xs font-medium md:inline">Layers</span>
      </button>
      <MapSettingsDialog open={open} onOpenChange={setOpen} />
    </>
  );
};
