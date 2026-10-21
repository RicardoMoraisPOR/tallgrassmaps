import { useEffect, useState } from 'react';

import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';

import type { FloorStack } from '../MapViewer';
import { cssColor, probe, toRgba } from './glColors';
import { rectCorners } from './glCoordinates';

const SOURCE = 'frames';
const LABELS = 'frame-labels';
const FADE_MS = 150;
const RATIO = 2;

type Frame = FloorStack['floors'][number];

type Style = 'plain' | 'selected' | 'dotted';

type GlFramesProps = {
  map: MapLibreMap;
  frames: Array<Frame>;
  selected: string;
  faded?: boolean;
  outlineSelected?: boolean;
  dottedSelected?: boolean;
};

const styleOf = (
  id: string,
  selected: string,
  outlineSelected: boolean,
  dottedSelected: boolean,
): Style =>
  id !== selected
    ? 'plain'
    : dottedSelected
      ? 'dotted'
      : outlineSelected
        ? 'selected'
        : 'plain';

const labelName = (text: string, selected: boolean, dark: boolean) =>
  `frame-label|${dark ? 'dark' : 'light'}|${selected ? 'on' : 'off'}|${text}`;

const drawLabel = (text: string, selected: boolean) =>
  probe(
    `floor-label ${selected ? 'floor-label-selected' : ''}`,
    (element) => {
      element.textContent = text;

      const computed = getComputedStyle(element);
      const font = computed.font;
      const border = parseFloat(computed.borderTopWidth) || 1;
      const padX = parseFloat(computed.paddingLeft) || 8;
      const radius = parseFloat(computed.borderTopLeftRadius) || 4;
      const height =
        Math.round(parseFloat(computed.lineHeight) || 18) + border * 2 + 2;
      const measure = document.createElement('canvas').getContext('2d');

      if (!measure) throw new Error('No 2d context');

      measure.font = font;

      const width = Math.ceil(
        measure.measureText(text).width + padX * 2 + border * 2,
      );
      const canvas = document.createElement('canvas');

      canvas.width = width * RATIO;
      canvas.height = height * RATIO;

      const context = canvas.getContext('2d', { willReadFrequently: true });

      if (!context) throw new Error('No 2d context');

      context.scale(RATIO, RATIO);
      context.fillStyle = toRgba(computed.backgroundColor);
      context.strokeStyle = toRgba(computed.borderTopColor);
      context.lineWidth = border;
      context.beginPath();
      context.roundRect(
        border / 2,
        border / 2,
        width - border,
        height - border,
        radius,
      );
      context.fill();
      context.stroke();
      context.fillStyle = toRgba(computed.color);
      context.font = font;
      context.textBaseline = 'middle';
      context.fillText(text, border + padX, height / 2 + 0.5);

      return context.getImageData(0, 0, canvas.width, canvas.height);
    },
    'div',
  );

export const GlFrames = ({
  map,
  frames,
  selected,
  faded = false,
  outlineSelected = true,
  dottedSelected = false,
}: GlFramesProps) => {
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
    map.addSource(SOURCE, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
    map.addSource(LABELS, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
    map.addLayer(
      {
        id: 'frames-hit',
        type: 'fill',
        source: SOURCE,
        paint: { 'fill-color': '#000', 'fill-opacity': 0 },
      },
      'z-frames',
    );
    map.addLayer(
      {
        id: 'frames-line',
        type: 'line',
        source: SOURCE,
        layout: { 'line-cap': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['get', 'width'],
          'line-dasharray': ['get', 'dash'],
          'line-opacity-transition': { duration: FADE_MS },
        },
      },
      'z-frames',
    );
    map.addLayer(
      {
        id: 'frames-labels',
        type: 'symbol',
        source: LABELS,
        layout: {
          'icon-image': ['get', 'image'],
          'icon-anchor': 'bottom-left',
          'icon-offset': [2, -2],
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
          'icon-pitch-alignment': 'viewport',
          'icon-rotation-alignment': 'viewport',
        },
        paint: { 'icon-opacity-transition': { duration: FADE_MS } },
      },
      'z-areas',
    );

    return () => {
      ['frames-labels', 'frames-line', 'frames-hit'].forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id);
      });
      [LABELS, SOURCE].forEach((id) => {
        if (map.getSource(id)) map.removeSource(id);
      });
    };
  }, [map]);

  const frameKey = frames.map(({ id, name }) => `${id}:${name}`).join('|');

  useEffect(() => {
    const brand = cssColor('var(--brand)');
    const plain = cssColor(
      'color-mix(in oklab, var(--foreground) 35%, transparent)',
    );
    const looks = {
      plain: { color: plain, width: 1.5, dash: [5, 5] },
      selected: { color: brand, width: 4, dash: [1, 0] },
      dotted: { color: brand, width: 2, dash: [1, 5] },
    };

    (map.getSource(SOURCE) as GeoJSONSource | undefined)?.setData({
      type: 'FeatureCollection',
      features: frames.map((frame) => {
        const look =
          looks[styleOf(frame.id, selected, outlineSelected, dottedSelected)];

        return {
          type: 'Feature',
          properties: { frame: frame.id, ...look },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                ...rectCorners(frame.x, frame.y, frame.width, frame.height),
                rectCorners(frame.x, frame.y, frame.width, frame.height)[0],
              ],
            ],
          },
        };
      }),
    });
  }, [map, frameKey, selected, outlineSelected, dottedSelected, dark]);

  useEffect(() => {
    frames.forEach((frame) => {
      const isSelected = frame.id === selected;
      const name = labelName(frame.name, isSelected, dark);

      if (!map.hasImage(name)) {
        const data = drawLabel(frame.name, isSelected);

        map.addImage(name, data, { pixelRatio: RATIO });
      }
    });

    (map.getSource(LABELS) as GeoJSONSource | undefined)?.setData({
      type: 'FeatureCollection',
      features: frames.map((frame) => ({
        type: 'Feature',
        properties: {
          frame: frame.id,
          image: labelName(frame.name, frame.id === selected, dark),
        },
        geometry: {
          type: 'Point',
          coordinates: rectCorners(
            frame.x,
            frame.y,
            frame.width,
            frame.height,
          )[0],
        },
      })),
    });
  }, [map, frameKey, selected, dark]);

  useEffect(() => {
    map.setPaintProperty('frames-line', 'line-opacity', faded ? 0 : 1);
    map.setPaintProperty('frames-labels', 'icon-opacity', faded ? 0 : 1);
  }, [map, faded]);

  return null;
};
