import type { CSSProperties } from 'react';

import { Link } from 'react-router';

import type { Direction } from '@/data/maps';
import { travelState } from '@/lib/motion';

import type { MapLayer, MapLayerId } from './mapLayers';

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

type MapInfoCardProps = {
  groups: Array<PlaceLinkGroup>;
  layers: Array<MapLayer>;
  hiddenLayers: Set<MapLayerId>;
  onToggleLayer: (layer: MapLayerId) => void;
};

export const MapInfoCard = ({
  groups,
  layers,
  hiddenLayers,
  onToggleLayer,
}: MapInfoCardProps) => {
  const filled = groups.filter((group) => group.links.length > 0);

  return (
    <section
      aria-labelledby="map-info-heading"
      className="flex flex-col gap-4 rounded-[14px] border bg-card p-5"
    >
      <h2
        id="map-info-heading"
        className="text-xs font-medium tracking-wider text-muted-foreground uppercase"
      >
        Map info
      </h2>

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
          <h3 className="text-[13px] text-muted-foreground">Show on map</h3>
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
    </section>
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
