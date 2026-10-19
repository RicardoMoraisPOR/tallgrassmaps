import { type CSSProperties, useId } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { TABLET_QUERY } from '@/lib/breakpoints';

import {
  type LayerView,
  type MapLayer,
  layerViews,
  mapLayers,
  useSavedMapLayers,
} from './mapLayers';

type MapSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  view: LayerView;
  onViewChange: (view: LayerView) => void;
  withWorld: boolean;
};

const TITLE = 'Map settings';
const DESCRIPTION =
  'Choose which layers show on the maps. Saved in this browser.';

type SettingsBodyProps = Pick<
  MapSettingsDialogProps,
  'view' | 'onViewChange' | 'withWorld'
>;

const SettingsBody = ({ view, onViewChange, withWorld }: SettingsBodyProps) => {
  const shown = withWorld ? view : 'focus';
  const { isVisible, setVisible } = useSavedMapLayers(shown);

  return (
    <>
      {withWorld && (
        <ToggleGroup
          type="single"
          size="sm"
          spacing={1}
          aria-label="Layers for"
          value={shown}
          onValueChange={(value) => {
            if (value) onViewChange(value as LayerView);
          }}
          className="w-full rounded-sm border bg-card p-1"
        >
          {layerViews.map(({ id, label }) => (
            <ToggleGroupItem
              key={id}
              value={id}
              className="flex-1 data-[state=on]:bg-foreground data-[state=on]:text-background"
            >
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}
      {shown === 'world' && (
        <p className="text-xs text-muted-foreground">
          When zoomed out, the world map groups markers into counts.
        </p>
      )}
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
    </>
  );
};

export const MapSettingsDialog = ({
  open,
  onOpenChange,
  ...body
}: MapSettingsDialogProps) => {
  const tablet = useMediaQuery(TABLET_QUERY);

  if (!tablet)
    return (
      <Drawer direction="bottom" open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="data-[vaul-drawer-direction=bottom]:h-[85svh] data-[vaul-drawer-direction=bottom]:max-h-[85svh]">
          <DrawerTitle className="px-4 pt-4 font-heading text-lg font-bold">
            {TITLE}
          </DrawerTitle>
          <DrawerDescription className="px-4 text-sm text-muted-foreground">
            {DESCRIPTION}
          </DrawerDescription>
          <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-4">
            <SettingsBody {...body} />
          </div>
        </DrawerContent>
      </Drawer>
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85svh] flex-col gap-6 overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{TITLE}</DialogTitle>
          <DialogDescription>{DESCRIPTION}</DialogDescription>
        </DialogHeader>
        <SettingsBody {...body} />
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
