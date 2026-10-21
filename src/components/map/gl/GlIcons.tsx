import { useEffect, useState } from 'react';

import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';

import { useThemeStyle } from '@/components/settings/themes';

import { linkKey } from '../viewer/links';
import type { MapLink } from '../viewer/types';
import { ensureImage } from './glBadgeImages';
import { BASE_ZOOM, toLngLat } from './glCoordinates';
import {
  drawStep,
  ensureIconImages,
  ICON_SIZE,
  type IconSpec,
  iconImageName,
  stepImageName,
  stepSizeFor,
} from './glIconImages';

const ICONS = 'icons';
const ACTIVE = 'icons-active';
const PRESSED = 'icons-pressed';
const STEPS = 'icon-steps';
const PRESS_MS = 240;
const PRESS_SCALE = 0.8;
const PRESS_DIP_AT = 0.4;
const PRESS_LEVELS = [0.8, 0.84, 0.88, 0.92, 0.96, 1];
const pressLayer = (index: number) => `${PRESSED}-${index}`;
const STEP_GAP_PX = 7;
const STEP_BOB_MS = 1000;
const MIN_ICON_PX = 16;
const MAX_ICON_PX = 28;
const TILE_RATIO = 1.3;
const TILE = 16;

const specOf = (
  link: MapLink,
  style: IconSpec['style'],
): IconSpec | undefined => {
  const { icon } = link;

  if (!icon) return undefined;

  return {
    kind: icon.kind,
    style,
    className: link.className ?? '',
    direction: icon.kind === 'arrow' ? icon.direction : undefined,
  };
};

const offsets = {
  north: [0, ICON_SIZE / 2],
  south: [0, -ICON_SIZE / 2],
  west: [ICON_SIZE / 2, 0],
  east: [-ICON_SIZE / 2, 0],
} as const;

const sizeStops = (factor = 1) => {
  const low = Math.log2(MIN_ICON_PX / (TILE * TILE_RATIO));
  const high = Math.log2(MAX_ICON_PX / (TILE * TILE_RATIO));

  return [
    'interpolate',
    ['exponential', 2],
    ['zoom'],
    BASE_ZOOM + low,
    (MIN_ICON_PX / ICON_SIZE) * factor,
    BASE_ZOOM + high,
    (MAX_ICON_PX / ICON_SIZE) * factor,
  ];
};

type GlIconsProps = {
  map: MapLibreMap;
  links: Array<MapLink>;
  activeKeys: Set<string>;
  pressedKey?: string;
  hoveredKey?: string;
};

export const GlIcons = ({
  map,
  links,
  activeKeys,
  pressedKey,
  hoveredKey,
}: GlIconsProps) => {
  const style = useThemeStyle('mapIcons');
  const [dark, setDark] = useState(
    document.documentElement.classList.contains('dark'),
  );

  useEffect(() => {
    const observer = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains('dark')),
    );

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    [ACTIVE, ICONS, PRESSED, STEPS].forEach((source) => {
      map.addSource(source, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      const layers =
        source === PRESSED
          ? PRESS_LEVELS.map((factor, index) => ({
              id: pressLayer(index),
              factor,
              opacity: 0,
            }))
          : [{ id: source, factor: 1, opacity: 1 }];

      layers.forEach(({ id, factor, opacity }) =>
        map.addLayer(
          {
            id,
            type: 'symbol',
            source,
            layout: {
              'icon-image': ['get', 'image'],
              'icon-anchor': 'center',
              'icon-offset': ['get', 'offset'],
              'icon-allow-overlap': true,
              'icon-ignore-placement': true,
              'icon-pitch-alignment': 'viewport',
              'icon-rotation-alignment': 'viewport',
              'icon-size': sizeStops(factor) as never,
            },
            paint: { 'icon-opacity': opacity },
          },
          'z-badges',
        ),
      );
    });

    return () => {
      [STEPS, ACTIVE, ICONS].forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id);
      });
      PRESS_LEVELS.forEach((_, index) => {
        if (map.getLayer(pressLayer(index))) map.removeLayer(pressLayer(index));
      });
      [STEPS, PRESSED, ACTIVE, ICONS].forEach((id) => {
        if (map.getSource(id)) map.removeSource(id);
      });
    };
  }, [map]);

  const iconLinks = links.flatMap((link) => {
    const spec = specOf(link, style);

    return spec ? [{ link, spec }] : [];
  });

  const featureOf = (
    { link, spec }: (typeof iconLinks)[number],
    active: boolean,
  ) => ({
    type: 'Feature' as const,
    properties: {
      key: linkKey(link),
      image: iconImageName(spec, active),
      offset: spec.direction ? offsets[spec.direction] : [0, 0],
    },
    geometry: {
      type: 'Point' as const,
      coordinates: toLngLat(link.x, link.y),
    },
  });

  useEffect(() => {
    let cancelled = false;

    ensureIconImages(
      map,
      iconLinks.map(({ spec }) => spec),
    ).then(() => {
      if (cancelled) return;

      (map.getSource(ICONS) as GeoJSONSource | undefined)?.setData({
        type: 'FeatureCollection',
        features: iconLinks.map((item) => featureOf(item, false)),
      });
    });

    return () => {
      cancelled = true;
    };
  }, [map, links, style, dark]);

  useEffect(() => {
    let cancelled = false;
    const active = iconLinks.filter(({ link }) =>
      activeKeys.has(linkKey(link)),
    );

    ensureIconImages(
      map,
      active.map(({ spec }) => spec),
    ).then(() => {
      if (cancelled) return;

      (map.getSource(ACTIVE) as GeoJSONSource | undefined)?.setData({
        type: 'FeatureCollection',
        features: active.map((item) => featureOf(item, true)),
      });
    });

    return () => {
      cancelled = true;
    };
  }, [map, links, style, dark, activeKeys]);

  useEffect(() => {
    if (!pressedKey) return undefined;

    const target = iconLinks.find(({ link }) => linkKey(link) === pressedKey);

    if (!target) return undefined;

    let frame = 0;
    let cancelled = false;
    let shown = -1;
    const hide = ['case', ['==', ['get', 'key'], pressedKey], 0, 1] as never;

    const show = (index: number) => {
      if (index === shown) return;

      if (shown >= 0)
        map.setPaintProperty(pressLayer(shown), 'icon-opacity', 0);

      map.setPaintProperty(pressLayer(index), 'icon-opacity', 1);
      shown = index;
    };

    const levelFor = (scale: number) =>
      PRESS_LEVELS.reduce(
        (best, level, index) =>
          Math.abs(level - scale) < Math.abs(PRESS_LEVELS[best] - scale)
            ? index
            : best,
        0,
      );

    const begin = () => {
      const start = performance.now();
      const reduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      const easeOut = (progress: number) => 1 - (1 - progress) ** 2;

      show(PRESS_LEVELS.length - 1);
      [ICONS, ACTIVE].forEach((id) =>
        map.setPaintProperty(id, 'icon-opacity', hide),
      );

      const step = (now: number) => {
        const t = Math.min((now - start) / PRESS_MS, 1);
        const scale =
          t < PRESS_DIP_AT
            ? 1 - (1 - PRESS_SCALE) * easeOut(t / PRESS_DIP_AT)
            : PRESS_SCALE +
              (1 - PRESS_SCALE) *
                easeOut((t - PRESS_DIP_AT) / (1 - PRESS_DIP_AT));

        show(levelFor(scale));

        if (t < 1 && !reduced) frame = requestAnimationFrame(step);
      };

      frame = requestAnimationFrame(step);
    };

    const onSourceData = (event: {
      sourceId?: string;
      isSourceLoaded?: boolean;
    }) => {
      if (event.sourceId !== PRESSED || !event.isSourceLoaded) return;

      map.off('sourcedata', onSourceData);
      begin();
    };

    ensureIconImages(map, [target.spec]).then(() => {
      if (cancelled) return;

      map.on('sourcedata', onSourceData);
      (map.getSource(PRESSED) as GeoJSONSource | undefined)?.setData({
        type: 'FeatureCollection',
        features: [featureOf(target, true)],
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      map.off('sourcedata', onSourceData);
      [ICONS, ACTIVE].forEach((id) => {
        if (map.getLayer(id)) map.setPaintProperty(id, 'icon-opacity', 1);
      });
      PRESS_LEVELS.forEach((_, index) => {
        if (map.getLayer(pressLayer(index)))
          map.setPaintProperty(pressLayer(index), 'icon-opacity', 0);
      });
      (map.getSource(PRESSED) as GeoJSONSource | undefined)?.setData({
        type: 'FeatureCollection',
        features: [],
      });
    };
  }, [map, pressedKey, style, dark]);

  useEffect(() => {
    const hovered = hoveredKey
      ? iconLinks.find(({ link }) => linkKey(link) === hoveredKey)
      : undefined;
    const direction =
      hovered?.link.icon && 'step' in hovered.link.icon
        ? hovered.link.icon.step
        : undefined;
    const source = map.getSource(STEPS) as GeoJSONSource | undefined;

    if (!hovered || !direction) {
      source?.setData({ type: 'FeatureCollection', features: [] });

      return undefined;
    }

    let frame = 0;
    let cancelled = false;
    const name = stepImageName(style, direction);
    const size = stepSizeFor(style);
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const x = ICON_SIZE / 2 + STEP_GAP_PX + size / 2;
    const rest = direction === 'up' ? 2 : -2;
    const peak = direction === 'up' ? -3 : 3;

    ensureImage(map, name, () => drawStep(style, direction)).then(() => {
      if (cancelled) return;

      source?.setData({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { image: name },
            geometry: {
              type: 'Point',
              coordinates: toLngLat(hovered.link.x, hovered.link.y),
            },
          },
        ],
      });

      const start = performance.now();

      const bob = (now: number) => {
        const phase = ((now - start) % STEP_BOB_MS) / STEP_BOB_MS;
        const up = phase < 0.3 ? phase / 0.3 : (1 - phase) / 0.7;
        const eased = up * up * (3 - 2 * up);
        const y = rest + (peak - rest) * eased;

        map.setLayoutProperty(STEPS, 'icon-offset', [x, y]);

        if (!reduced) frame = requestAnimationFrame(bob);
      };

      frame = requestAnimationFrame(bob);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [map, hoveredKey, links, style, dark]);

  return null;
};
