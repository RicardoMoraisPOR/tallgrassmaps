import { useEffect, useRef } from 'react';

import { DomEvent } from 'leaflet';

import { cn } from '@/lib/utils';

import type { ZoneLayer } from './zoneLayers';

type ZoneLayerToggleProps = {
  layers: Array<ZoneLayer>;
  active: string | undefined;
  onChange: (id: string) => void;
};

export const ZoneLayerToggle = ({
  layers,
  active,
  onChange,
}: ZoneLayerToggleProps) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    DomEvent.disableClickPropagation(container.current);
    DomEvent.disableScrollPropagation(container.current);
  }, []);

  return (
    <div
      ref={container}
      role="group"
      aria-label="Map layer"
      className="absolute bottom-3 left-1/2 z-1000 flex -translate-x-1/2 gap-0.5 rounded-[14px] border bg-card p-1"
    >
      {layers.map(({ id, label, count }) => (
        <button
          key={id}
          type="button"
          aria-pressed={active === id}
          disabled={count === 0}
          title={count === 0 ? 'Nothing mapped here yet' : undefined}
          onClick={() => onChange(id)}
          className={cn(
            'h-8 rounded-[10px] px-3 text-[13px] font-medium whitespace-nowrap text-muted-foreground outline-none disabled:pointer-events-none disabled:opacity-40 transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50',
            active === id &&
              'bg-foreground text-background hover:text-background',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
