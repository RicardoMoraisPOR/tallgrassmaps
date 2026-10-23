import { type CSSProperties, useId } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { TABLET_QUERY } from '@/lib/breakpoints';
import { useSettingsStore } from '@/stores/settings';

import {
  groupingLevels,
  type MapLayer,
  isLayerVisible,
  mapLayers,
  nearestGroupingLevel,
} from './mapLayers';

type MapSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const TITLE = 'Layer settings';

const SettingsBody = () => {
  const layers = useSettingsStore((state) => state.mapLayers);
  const clusterZoom = useSettingsStore((state) => state.clusterZoom);
  const setMapLayer = useSettingsStore((state) => state.setMapLayer);
  const setClusterZoom = useSettingsStore((state) => state.setClusterZoom);
  const reset = useSettingsStore((state) => state.resetMapSettings);
  const groupingId = useId();
  const grouping = nearestGroupingLevel(clusterZoom);

  return (
    <>
      <div className="flex min-h-0 flex-1 [scrollbar-gutter:stable] flex-col gap-6 overflow-x-hidden overflow-y-auto overscroll-contain py-2 pr-3">
        <div className="flex flex-col gap-2">
          <h3 id={groupingId} className="text-sm font-medium">
            Overview icons zoom
          </h3>
          <ToggleGroup
            type="single"
            size="sm"
            spacing={1}
            aria-labelledby={groupingId}
            value={grouping.label}
            onValueChange={(label) => {
              const level = groupingLevels.find(
                (entry) => entry.label === label,
              );

              if (level) setClusterZoom(level.clusterZoom);
            }}
            className="w-full rounded-sm border bg-card p-1"
          >
            {groupingLevels.map(({ label }) => (
              <ToggleGroupItem
                key={label}
                value={label}
                className="flex-1 data-[state=on]:bg-foreground data-[state=on]:text-background"
              >
                {label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <p className="text-xs text-muted-foreground">{grouping.hint}</p>
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-medium">Visibility</h3>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-x-8">
            {mapLayers.map((layer) => (
              <LayerRow
                key={layer.id}
                layer={layer}
                checked={isLayerVisible(layers, layer.id)}
                onCheckedChange={(visible) => setMapLayer(layer.id, visible)}
              />
            ))}
          </div>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="xs"
        className="self-end text-muted-foreground"
        onClick={reset}
      >
        Reset
      </Button>
    </>
  );
};

export const MapSettingsDialog = ({
  open,
  onOpenChange,
}: MapSettingsDialogProps) => {
  const tablet = useMediaQuery(TABLET_QUERY);

  if (!tablet)
    return (
      <Drawer direction="bottom" open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          aria-describedby={undefined}
          className="data-[vaul-drawer-direction=bottom]:h-[85svh] data-[vaul-drawer-direction=bottom]:max-h-[85svh]"
        >
          <DrawerTitle className="px-4 pt-4 font-heading text-lg font-bold">
            {TITLE}
          </DrawerTitle>
          <div className="flex min-h-0 flex-1 flex-col gap-6 p-4">
            <SettingsBody />
          </div>
        </DrawerContent>
      </Drawer>
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="flex max-h-[85svh] flex-col gap-6 sm:max-w-xl"
      >
        <DialogHeader>
          <DialogTitle>{TITLE}</DialogTitle>
        </DialogHeader>
        <SettingsBody />
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
