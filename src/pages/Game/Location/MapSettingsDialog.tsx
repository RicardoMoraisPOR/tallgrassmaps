import { type CSSProperties, useId } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

import { type MapLayer, mapLayers, useSavedMapLayers } from './mapLayers';

type MapSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const MapSettingsDialog = ({
  open,
  onOpenChange,
}: MapSettingsDialogProps) => {
  const { isVisible, setVisible } = useSavedMapLayers();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85svh] flex-col gap-6 overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Map settings</DialogTitle>
          <DialogDescription>
            Choose which layers show on the maps. Saved in this browser.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {mapLayers.map((layer) => (
            <LayerRow
              key={layer.id}
              layer={layer}
              checked={isVisible(layer.id)}
              onCheckedChange={(visible) => setVisible(layer.id, visible)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

type LayerRowProps = {
  layer: MapLayer;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

const LayerRow = ({ layer, checked, onCheckedChange }: LayerRowProps) => {
  const id = useId();

  return (
    <div className="flex items-center justify-between gap-4">
      <label htmlFor={id} className="flex items-center gap-2.5 text-sm">
        <span
          aria-hidden
          className="size-3 rounded-[3px] border-2 border-(--layer) bg-(--layer)/30"
          style={{ '--layer': layer.color } as CSSProperties}
        />
        {layer.label}
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
};
