import { useState } from 'react';

import { Layers } from 'lucide-react';

import { useGameRoute } from '@/hooks/useGameRoute';
import { cn } from '@/lib/utils';

import { toolbarButtonClass } from '../toolbarButton';
import type { LayerView } from './mapLayers';
import { MapSettingsDialog } from './MapSettingsDialog';

export const MapLayersButton = ({ view }: { view: LayerView }) => {
  const route = useGameRoute();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(view);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label="Map layers"
        title="Map layers"
        onClick={() => {
          setSelected(view);
          setOpen(true);
        }}
        className={cn(toolbarButtonClass, 'text-foreground')}
      >
        <Layers aria-hidden className="size-5 flex-none md:size-4" />
        <span className="hidden text-xs font-medium md:inline">Layers</span>
      </button>
      <MapSettingsDialog
        open={open}
        onOpenChange={setOpen}
        view={selected}
        onViewChange={setSelected}
        withWorld={Boolean(route?.region.world)}
      />
    </>
  );
};
