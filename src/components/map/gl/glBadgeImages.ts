import type { Map as MapLibreMap } from 'maplibre-gl';

import type { ThemeStyle } from '@/stores/settings';

import { isDark, probeHtml, toRgba } from './glColors';

export const BADGE_RATIO = 2;
const MONSTER_SPRITE = '/sprites/rby/overworld/monster.png';
const SPRITE_FRAMES = 3;
const BADGE_FONT_PX = 14;
const CLUSTER_GAP = 4;

type Pill = { text: string; color: string };

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

const measure = (font: string, text: string) => {
  const context = document.createElement('canvas').getContext('2d');

  if (!context) throw new Error('No 2d context');

  context.font = font;

  return context.measureText(text).width;
};

const newCanvas = (width: number, height: number) => {
  const canvas = document.createElement('canvas');

  canvas.width = Math.ceil(width * BADGE_RATIO);
  canvas.height = Math.ceil(height * BADGE_RATIO);

  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (!context) throw new Error('No 2d context');

  context.scale(BADGE_RATIO, BADGE_RATIO);

  return { canvas, context };
};

export const clusterImageName = (pills: Array<Pill>, compact: boolean) =>
  `cluster|${isDark() ? 'dark' : 'light'}|${compact ? 'compact' : 'full'}|${pills.map(({ text, color }) => `${text}:${color}`).join(',')}`;

export const clusterImage = (pills: Array<Pill>, compact: boolean) => {
  const measured = pills.map(({ text, color }) =>
    probeHtml(
      `<span class="map-cluster-row ${compact ? 'map-cluster-compact' : ''}"><span class="map-cluster" style="--layer:${color}">${text}</span></span>`,
      (root) => {
        const pill = root.querySelector<HTMLElement>('.map-cluster');

        if (!pill) throw new Error('No cluster pill');

        const computed = getComputedStyle(pill);
        const border = parseFloat(computed.borderTopWidth) || 2;
        const padding = parseFloat(computed.paddingLeft) || 0;
        const height = parseFloat(computed.height) || 26;
        const minWidth = parseFloat(computed.minWidth) || height;

        return {
          text,
          font: computed.font,
          background: toRgba(computed.backgroundColor),
          color: toRgba(computed.color),
          border,
          borderColor: toRgba(computed.borderTopColor),
          height,
          width: Math.max(
            minWidth,
            measure(computed.font, text) + padding * 2 + border * 2,
          ),
        };
      },
    ),
  );
  const width =
    measured.reduce((sum, pill) => sum + pill.width, 0) +
    CLUSTER_GAP * (measured.length - 1);
  const height = Math.max(...measured.map((pill) => pill.height));
  const { canvas, context } = newCanvas(width, height);
  let left = 0;

  measured.forEach((pill) => {
    const top = (height - pill.height) / 2;

    context.fillStyle = pill.background;
    context.strokeStyle = pill.borderColor;
    context.lineWidth = pill.border;
    context.beginPath();
    context.roundRect(
      left + pill.border / 2,
      top + pill.border / 2,
      pill.width - pill.border,
      pill.height - pill.border,
      pill.height,
    );
    context.fill();
    context.stroke();
    context.fillStyle = pill.color;
    context.font = pill.font;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(
      pill.text,
      left + pill.width / 2,
      top + pill.height / 2 + 0.5,
    );
    left += pill.width + CLUSTER_GAP;
  });

  return context.getImageData(0, 0, canvas.width, canvas.height);
};

const BALL_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="2" stroke-linecap="round"><path d="M3 12a9 9 0 0 1 18 0z" fill="COLOR" fill-opacity="0.35" stroke="none"/><circle cx="12" cy="12" r="9"/><path d="M3 12h5.5M15.5 12H21"/><circle cx="12" cy="12" r="3.25" fill="CARD"/></svg>';

export const badgeImageName = (count: number, style: ThemeStyle) =>
  `badge|${isDark() ? 'dark' : 'light'}|${style}|${count}`;

export const badgeImage = async (count: number, style: ThemeStyle) => {
  const game = style === 'game';
  const values = probeHtml(
    `<span class="map-wild-badge map-link-wild-badge ${game ? 'map-wild-badge-game' : ''}" style="font-size:${BADGE_FONT_PX}px">${count}</span>`,
    (root) => {
      const badge = root.querySelector<HTMLElement>('.map-wild-badge');

      if (!badge) throw new Error('No badge');

      const computed = getComputedStyle(badge);
      const shadow = computed.boxShadow.match(
        /(color\([^)]*\)|rgba?\([^)]*\)|oklch\([^)]*\)|oklab\([^)]*\)|#[0-9a-f]+)\s+0px\s+0px\s+0px\s+([\d.]+)px/i,
      );
      const card = getComputedStyle(root).getPropertyValue('--card');

      return {
        font: computed.font,
        background: toRgba(computed.backgroundColor),
        color: toRgba(computed.color),
        border: parseFloat(computed.borderTopWidth) || 0,
        borderColor: toRgba(computed.borderTopColor),
        radius: parseFloat(computed.borderTopLeftRadius) || 0,
        padding: parseFloat(computed.paddingLeft) || 0,
        minWidth: parseFloat(computed.minWidth) || 0,
        height: parseFloat(computed.height) || 28,
        gap: parseFloat(computed.columnGap) || 0,
        ring: shadow ? toRgba(shadow[1]) : 'transparent',
        ringWidth: shadow ? parseFloat(shadow[2]) : 0,
        link: toRgba(computed.getPropertyValue('--map-link')),
        card: toRgba(card || '#fff'),
      };
    },
  );
  const art = Math.round(BADGE_FONT_PX * 1.27);
  const textWidth = measure(values.font, String(count));
  const icon = game
    ? await loadImage(MONSTER_SPRITE)
    : await loadImage(
        `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
          BALL_SVG.replace(/COLOR/g, values.color).replace('CARD', values.card),
        )}`,
      );
  const width = Math.max(
    values.minWidth,
    values.padding * 2 + art + values.gap + textWidth + values.border * 2,
  );
  const ring = game ? 0 : values.ringWidth;
  const { canvas, context } = newCanvas(
    width + ring * 2,
    values.height + ring * 2,
  );

  context.translate(ring, ring);

  if (ring > 0) {
    context.fillStyle = values.ring;
    context.beginPath();
    context.roundRect(
      -ring,
      -ring,
      width + ring * 2,
      values.height + ring * 2,
      values.radius + ring,
    );
    context.fill();
  }

  context.fillStyle = values.background;
  context.beginPath();
  context.roundRect(0, 0, width, values.height, values.radius);
  context.fill();

  if (values.border > 0) {
    context.strokeStyle = values.borderColor;
    context.lineWidth = values.border;
    context.beginPath();
    context.roundRect(
      values.border / 2,
      values.border / 2,
      width - values.border,
      values.height - values.border,
      values.radius,
    );
    context.stroke();
  }

  const contentWidth = art + values.gap + textWidth;
  const startX = (width - contentWidth) / 2;

  context.imageSmoothingEnabled = !game;

  if (game) {
    const frame = icon.naturalHeight / SPRITE_FRAMES;

    context.drawImage(
      icon,
      0,
      0,
      icon.naturalWidth,
      frame,
      startX,
      (values.height - art) / 2,
      art,
      art,
    );
  } else {
    context.drawImage(icon, startX, (values.height - art) / 2, art, art);
  }

  context.fillStyle = values.color;
  context.font = values.font;
  context.textBaseline = 'middle';
  context.fillText(
    String(count),
    startX + art + values.gap,
    values.height / 2 + 0.5,
  );

  return context.getImageData(0, 0, canvas.width, canvas.height);
};

const requested = new WeakMap<MapLibreMap, Map<string, Promise<void>>>();

export const ensureImage = (
  map: MapLibreMap,
  name: string,
  make: () => ImageData | Promise<ImageData>,
) => {
  const known = requested.get(map) ?? new Map<string, Promise<void>>();

  requested.set(map, known);

  const pending =
    known.get(name) ??
    Promise.resolve()
      .then(make)
      .then((data) => {
        if (!map.hasImage(name))
          map.addImage(name, data, { pixelRatio: BADGE_RATIO });
      })
      .catch(() => undefined);

  known.set(name, pending);

  return pending;
};
