import type { Map as MapLibreMap } from 'maplibre-gl';

import type { ThemeStyle } from '@/stores/settings';

import { mapIconArt, mapStepArt } from '../viewer/iconArt';
import type { MapIconKind } from '../viewer/types';
import { cssColor, isDark, probe, toRgba } from './glColors';

export const ICON_SIZE = 28;
export const ICON_RATIO = 2;
const GLOW_PADDING = 14;

type IconStyleValues = {
  background: string;
  color: string;
  ring: string;
  ringWidth: number;
  border: number;
  borderColor: string;
  radius: number;
  art: number;
  link: string;
};

export type IconSpec = {
  kind: MapIconKind['kind'];
  style: ThemeStyle;
  className: string;
  direction?: 'north' | 'south' | 'east' | 'west';
};

const rotations = { north: 0, east: 90, south: 180, west: 270 } as const;

const readStyle = (spec: IconSpec): IconStyleValues => {
  const classes = `map-icon ${spec.className} ${spec.style === 'game' ? 'map-icon-game' : ''}`;

  return probe(`${isDark() ? 'dark ' : ''}${classes}`, (element) => {
    element.style.setProperty('--icon-size', `${ICON_SIZE}px`);
    element.innerHTML = mapIconArt[spec.kind][spec.style];

    const computed = getComputedStyle(element);
    const svg = element.querySelector('svg');
    const artSize = svg ? parseFloat(getComputedStyle(svg).width) : 16;
    const shadow = computed.boxShadow.match(
      /(color\([^)]*\)|rgba?\([^)]*\)|oklch\([^)]*\)|oklab\([^)]*\)|#[0-9a-f]+)\s+0px\s+0px\s+0px\s+([\d.]+)px/i,
    );

    return {
      background: toRgba(computed.backgroundColor),
      color: toRgba(computed.color),
      ring: shadow ? toRgba(shadow[1]) : 'transparent',
      ringWidth: shadow ? parseFloat(shadow[2]) : 0,
      border: parseFloat(computed.borderTopWidth) || 0,
      borderColor: toRgba(computed.borderTopColor),
      radius: parseFloat(computed.borderTopLeftRadius) || 0,
      art: artSize,
      link: toRgba(computed.getPropertyValue('--map-link')),
    };
  });
};

const roundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
};

const loadArt = (svg: string, color: string, size: number) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const sized = svg
      .replace(/currentColor/g, color)
      .replace(
        '<svg ',
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" `,
      );
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sized)}`;
  });

const canvasOf = (size: number) => {
  const canvas = document.createElement('canvas');

  canvas.width = size * ICON_RATIO;
  canvas.height = size * ICON_RATIO;

  const context = canvas.getContext('2d', { willReadFrequently: true });

  context?.scale(ICON_RATIO, ICON_RATIO);

  return { canvas, context };
};

export const iconImageName = (spec: IconSpec, active: boolean) =>
  `icon|${isDark() ? 'dark' : 'light'}|${spec.style}|${spec.kind}|${spec.className}|${spec.direction ?? ''}|${active ? 'active' : 'idle'}`;

const draw = async (spec: IconSpec, active: boolean) => {
  const values = readStyle(spec);
  const pad = active ? GLOW_PADDING : 0;
  const size = ICON_SIZE + pad * 2;
  const { canvas, context } = canvasOf(size);

  if (!context) throw new Error('No 2d context');

  const { game } = { game: spec.style === 'game' };
  const art = await loadArt(
    mapIconArt[spec.kind][spec.style],
    values.color,
    Math.round(values.art),
  );

  context.save();

  if (active) {
    context.filter = game
      ? `drop-shadow(1.5px 0 0 ${values.link}) drop-shadow(-1.5px 0 0 ${values.link}) drop-shadow(0 1.5px 0 ${values.link}) drop-shadow(0 -1.5px 0 ${values.link}) drop-shadow(0 0 4px ${values.link})`
      : `drop-shadow(0 0 3px ${values.link}) drop-shadow(0 0 8px ${values.link})`;
  }

  if (!game && values.ringWidth > 0) {
    context.fillStyle = values.ring;
    roundedRect(
      context,
      pad - values.ringWidth,
      pad - values.ringWidth,
      ICON_SIZE + values.ringWidth * 2,
      ICON_SIZE + values.ringWidth * 2,
      values.radius + values.ringWidth,
    );
    context.fill();
  }

  context.fillStyle = values.background;
  roundedRect(context, pad, pad, ICON_SIZE, ICON_SIZE, values.radius);
  context.fill();

  if (values.border > 0) {
    context.strokeStyle = values.borderColor;
    context.lineWidth = values.border;
    roundedRect(
      context,
      pad + values.border / 2,
      pad + values.border / 2,
      ICON_SIZE - values.border,
      ICON_SIZE - values.border,
      values.radius,
    );
    context.stroke();
  }

  context.restore();
  context.save();
  context.translate(pad + ICON_SIZE / 2, pad + ICON_SIZE / 2);

  if (spec.direction)
    context.rotate((rotations[spec.direction] * Math.PI) / 180);

  context.drawImage(art, -art.width / 2, -art.height / 2);
  context.restore();

  return context.getImageData(0, 0, canvas.width, canvas.height);
};

const requested = new WeakMap<MapLibreMap, Map<string, Promise<void>>>();

export const ensureIconImages = async (
  map: MapLibreMap,
  specs: Array<IconSpec>,
) => {
  const known = requested.get(map) ?? new Map<string, Promise<void>>();

  requested.set(map, known);

  await Promise.all(
    specs.flatMap((spec) =>
      [false, true].map((active) => {
        const name = iconImageName(spec, active);
        const pending =
          known.get(name) ??
          draw(spec, active)
            .then((data) => {
              if (!map.hasImage(name))
                map.addImage(name, data, { pixelRatio: ICON_RATIO });
            })
            .catch(() => undefined);

        known.set(name, pending);

        return pending;
      }),
    ),
  );
};

export const ICON_GLOW_PADDING = GLOW_PADDING;

export type StepDirection = 'up' | 'down';

const STEP_RATIO = { game: 0.5, 'tall-grass': 0.65 } as const;
const STEP_PADDING = 6;

export const stepSizeFor = (style: ThemeStyle) => ICON_SIZE * STEP_RATIO[style];

export const stepImageName = (style: ThemeStyle, direction: StepDirection) =>
  `step|${isDark() ? 'dark' : 'light'}|${style}|${direction}`;

export const drawStep = async (style: ThemeStyle, direction: StepDirection) => {
  const size = stepSizeFor(style);
  const ink = style === 'game' ? '#292929' : cssColor('var(--foreground)');
  const edge = style === 'game' ? '#f6f4f7' : cssColor('var(--popover)');
  const art = await new Promise<HTMLImageElement>((resolve, reject) => {
    const svg = mapStepArt[style]
      .replace(/var\(--step-ink\)/g, ink)
      .replace(/var\(--step-edge\)/g, edge)
      .replace(
        '<svg ',
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" `,
      );
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
  const total = size + STEP_PADDING * 2;
  const { canvas, context } = canvasOf(total);

  if (!context) throw new Error('No 2d context');

  if (style !== 'game')
    context.filter = 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.35))';

  context.translate(total / 2, total / 2);

  if (direction === 'down') context.rotate(Math.PI);

  context.drawImage(art, -size / 2, -size / 2);

  return context.getImageData(0, 0, canvas.width, canvas.height);
};
