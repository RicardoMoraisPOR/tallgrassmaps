import { useEffect, useRef, useState } from 'react';

import {
  type GbcPaletteId,
  gbcPalettes,
  paletteColors,
} from '@/data/maps/gbcPalettes';

export type MapPalette = {
  on: boolean;
  onToggle: () => void;
  of: (floorId?: string) => GbcPaletteId | undefined;
  objectsOf: (floorId?: string) => GbcPaletteId | undefined;
};

const FADE_MS = 200;
const FADE_GRACE_MS = 50;
const PALETTE_CLASS = 'map-palette-';

const ids = Object.keys(gbcPalettes) as Array<GbcPaletteId>;

const IMAGE_GREYS = [0, 96, 168, 248].map((grey) => grey / 255);

const mix = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;

const tableFor = (id: GbcPaletteId, channel: number, amount: number) =>
  paletteColors(id)
    .map((color, shade) =>
      mix(IMAGE_GREYS.toReversed()[shade], color[channel], amount).toFixed(3),
    )
    .toReversed()
    .join(' ');

const rules = ids
  .map((id) => `.${PALETTE_CLASS}${id}{filter:url(#${PALETTE_CLASS}${id})}`)
  .join('');

export const paletteClass = (id: GbcPaletteId | undefined) =>
  id ? `${PALETTE_CLASS}${id}` : '';

export const setPaletteClass = (element: Element, className: string) => {
  [...element.classList]
    .filter((name) => name.startsWith(PALETTE_CLASS))
    .forEach((name) => element.classList.remove(name));

  if (className) element.classList.add(className);
};

export const usePaletteApplied = (on: boolean) => {
  const [applied, setApplied] = useState(on);

  useEffect(() => {
    if (on) {
      setApplied(true);

      return undefined;
    }

    const timer = setTimeout(() => setApplied(false), FADE_MS + FADE_GRACE_MS);

    return () => clearTimeout(timer);
  }, [on]);

  return on || applied;
};

export const PaletteFilters = ({ on }: { on: boolean }) => {
  const amount = useRef(on ? 1 : 0);
  const initial = useRef(amount.current).current;
  const tables = useRef(new Map<string, SVGElement>());

  useEffect(() => {
    const target = on ? 1 : 0;
    const from = amount.current;
    const instant = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const start = performance.now();
    let frame = 0;

    const render = (value: number) => {
      amount.current = value;
      tables.current.forEach((element, key) => {
        const [id, channel] = key.split(':');

        element.setAttribute(
          'tableValues',
          tableFor(id as GbcPaletteId, Number(channel), value),
        );
      });
    };

    const step = (now: number) => {
      const progress = instant ? 1 : Math.min((now - start) / FADE_MS, 1);

      render(mix(from, target, progress));

      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frame);
  }, [on]);

  const register = (key: string) => (element: SVGElement | null) => {
    if (element) tables.current.set(key, element);
    else tables.current.delete(key);
  };

  return (
    <>
      <style>{rules}</style>
      <svg aria-hidden width={0} height={0} className="absolute">
        <defs>
          {ids.map((id) => (
            <filter
              key={id}
              id={`${PALETTE_CLASS}${id}`}
              colorInterpolationFilters="sRGB"
            >
              <feComponentTransfer>
                <feFuncR
                  ref={register(`${id}:0`)}
                  type="discrete"
                  tableValues={tableFor(id, 0, initial)}
                />
                <feFuncG
                  ref={register(`${id}:1`)}
                  type="discrete"
                  tableValues={tableFor(id, 1, initial)}
                />
                <feFuncB
                  ref={register(`${id}:2`)}
                  type="discrete"
                  tableValues={tableFor(id, 2, initial)}
                />
              </feComponentTransfer>
            </filter>
          ))}
        </defs>
      </svg>
    </>
  );
};
