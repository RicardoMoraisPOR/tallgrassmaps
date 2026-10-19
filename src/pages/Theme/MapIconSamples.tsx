import { mapIconArt, mapStepArt } from '@/components/map/viewer/iconArt';
import type { MapIconKind } from '@/components/map/viewer/types';
import { wildBadgeHtml } from '@/components/map/viewer/WildAreaArt';
import { cn } from '@/lib/utils';
import type { ThemeStyle } from '@/stores/settings';

type Sample = {
  kind: MapIconKind['kind'];
  layer: string;
  direction?: 'north' | 'east' | 'south' | 'west';
  step?: 'up' | 'down';
};

const SAMPLES: Array<Sample> = [
  { kind: 'arrow', layer: 'connection', direction: 'north' },
  { kind: 'arrow', layer: 'connection', direction: 'east' },
  { kind: 'exit', layer: 'connection' },
  { kind: 'stairs', layer: 'connection', step: 'up' },
  { kind: 'stairs', layer: 'connection', step: 'down' },
  { kind: 'ladder', layer: 'connection', step: 'up' },
  { kind: 'hole', layer: 'connection' },
  { kind: 'teleport', layer: 'connection' },
  { kind: 'current', layer: 'connection' },
  { kind: 'door', layer: 'entrance' },
  { kind: 'register', layer: 'service' },
  { kind: 'sign', layer: 'sign' },
];

const ICON_PIXELS = 32;

export const MapIconSamples = ({
  style,
  wildBadge = true,
}: {
  style: ThemeStyle;
  wildBadge?: boolean;
}) => {
  return (
    <ul className="flex flex-wrap gap-3">
      {SAMPLES.map(({ kind, layer, direction, step }) => (
        <li
          key={`${kind}-${direction ?? step ?? ''}`}
          className="flex w-24 flex-col items-center gap-2 rounded-sm border bg-muted/40 p-3"
        >
          <span
            className="relative flex size-9 items-center justify-center"
            style={{ ['--map-icon-size' as string]: `${ICON_PIXELS}px` }}
          >
            <span
              data-direction={direction}
              className={cn(
                'map-icon',
                `map-link-${layer}`,
                style === 'game' && 'map-icon-game',
              )}
              dangerouslySetInnerHTML={{ __html: mapIconArt[kind][style] }}
            />
            {step && (
              <span
                data-step={step}
                className="map-icon-step"
                dangerouslySetInnerHTML={{ __html: mapStepArt[style] }}
              />
            )}
          </span>
          <span className="text-center font-mono text-[10px] text-muted-foreground">
            {[kind, direction ?? step].filter(Boolean).join(' ')}
          </span>
        </li>
      ))}
      {wildBadge && (
        <li className="flex w-24 flex-col items-center gap-2 rounded-sm border bg-muted/40 p-3">
          <span
            className="flex size-9 items-center justify-center [&>span]:transform-none!"
            dangerouslySetInnerHTML={{ __html: wildBadgeHtml(style, 3) }}
          />
          <span className="text-center font-mono text-[10px] text-muted-foreground">
            wild badge
          </span>
        </li>
      )}
    </ul>
  );
};
