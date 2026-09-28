import { type CSSProperties, useState } from 'react';

import { Settings2 } from 'lucide-react';
import { Link } from 'react-router';

import type { Direction } from '@/data/maps';
import { travelState } from '@/lib/motion';

import type { MapLayer, MapLayerId } from './mapLayers';
import { MapSettingsDialog } from './MapSettingsDialog';

export type PlaceLink = {
  href: string;
  name: string;
  travel?: Direction;
  replace?: boolean;
};

export type PlaceLinkGroup = {
  label: string;
  links: Array<PlaceLink>;
};

type MapInfoTabProps = {
  groups: Array<PlaceLinkGroup>;
  layers: Array<MapLayer>;
  hiddenLayers: Set<MapLayerId>;
  onToggleLayer: (layer: MapLayerId) => void;
  onLayerSettingChange: (layer: MapLayerId) => void;
  onHighlight: (href: string | undefined) => void;
};

export const MapInfoTab = ({
  groups,
  layers,
  hiddenLayers,
  onToggleLayer,
  onLayerSettingChange,
  onHighlight,
}: MapInfoTabProps) => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const filled = groups.filter((group) => group.links.length > 0);

  return (
    <>
      {filled.map(({ label, links }) => (
        <div key={label} className="flex flex-col gap-2">
          <h3 className="text-[13px] text-muted-foreground">{label}</h3>
          <ul className="flex flex-wrap gap-1.5">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  state={travelState(link.travel)}
                  replace={link.replace}
                  preventScrollReset={link.replace}
                  className="inline-flex h-7 items-center rounded-full border px-2.5 text-[13px] whitespace-nowrap transition-colors hover:bg-muted"

                  onMouseEnter={() => onHighlight(link.href)}
                  onMouseLeave={() => onHighlight(undefined)}
                  onFocus={() => onHighlight(link.href)}
                  onBlur={() => onHighlight(undefined)}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {filled.length === 0 && (
        <p className="text-[13px] text-muted-foreground">
          Nothing else to open here yet.
        </p>
      )}

      {layers.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[13px] text-muted-foreground">On this map</h3>
            <button
              type="button"
              aria-label="Map settings"
              aria-haspopup="dialog"
              onClick={() => setSettingsOpen(true)}
              className="-m-1.5 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <Settings2 aria-hidden className="size-4" />
            </button>
          </div>
          <ul className="flex flex-wrap gap-1.5">
            {layers.map((layer) => (
              <li key={layer.id}>
                <LayerToggle
                  layer={layer}
                  visible={!hiddenLayers.has(layer.id)}
                  onToggle={() => onToggleLayer(layer.id)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
      <MapSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onLayerChange={onLayerSettingChange}
      />
    </>
  );
};

const LayerToggle = ({
  layer,
  visible,
  onToggle,
}: {
  layer: MapLayer;
  visible: boolean;
  onToggle: () => void;
}) => {
  return (
    <button
      type="button"
      aria-pressed={visible}
      onClick={onToggle}
      style={{ '--layer': layer.color } as CSSProperties}
      className="group inline-flex h-7 items-center gap-2 rounded-full border px-2.5 text-[13px] whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted aria-pressed:border-(--layer) aria-pressed:bg-(--layer)/15 aria-pressed:text-foreground"
    >
      <span
        aria-hidden
        className="size-3 rounded-[3px] border-2 border-muted-foreground/60 transition-colors group-aria-pressed:border-(--layer) group-aria-pressed:bg-(--layer)/30"
      />
      {layer.label}
    </button>
  );
};
