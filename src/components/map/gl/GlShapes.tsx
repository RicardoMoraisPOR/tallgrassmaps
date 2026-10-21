import { useEffect } from 'react';

import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';

import { linkKey } from '../viewer/links';
import type { MapLink } from '../viewer/types';
import { linkColor } from './glColors';
import { toLngLat } from './glCoordinates';
import { addWildPatterns } from './glPatterns';

const IDLE = 'shapes';
const ACTIVE = 'shapes-active';
const HOVER_FILL = 0.235;
const HIGHLIGHT_FILL = 0.35;
const PINNED_FILL = 0.2;

export type ShapeMode = 'hover' | 'selected' | 'highlight' | 'pinned';

export const isShape = (link: MapLink) =>
  !link.icon && !link.sprite && !link.badge;

type Kind = 'plain' | 'grass' | 'water' | 'whole';

const kindOf = (link: MapLink): Kind => {
  const classes = link.className ?? '';

  if (!classes.includes('map-link-wild-pokemon')) return 'plain';

  if (classes.includes('map-link-wild-whole')) return 'whole';

  return classes.includes('map-link-wild-water') ? 'water' : 'grass';
};

const ringsOf = (link: MapLink): Array<Array<[number, number]>> =>
  link.outline
    ? link.outline.map((ring) => ring)
    : [
        [
          [link.x, link.y],
          [link.x + link.width, link.y],
          [link.x + link.width, link.y + link.height],
          [link.x, link.y + link.height],
        ],
      ];

const featureOf = (link: MapLink, mode?: ShapeMode) => ({
  type: 'Feature' as const,
  properties: {
    key: linkKey(link),
    kind: kindOf(link),
    color: linkColor(link.className),
    mode: mode ?? 'idle',
    static: !link.href && !link.onClick && !link.tooltipOnClick,
  },
  geometry: {
    type: 'MultiPolygon' as const,
    coordinates: ringsOf(link).map((ring) => [
      [...ring, ring[0]].map(([x, y]) => toLngLat(x, y)),
    ]),
  },
});

const kindIs = (...kinds: Array<Kind>) =>
  ['in', ['get', 'kind'], ['literal', kinds]] as never;

const modeIs = (...modes: Array<ShapeMode>) =>
  ['in', ['get', 'mode'], ['literal', modes]] as never;

type GlShapesProps = {
  map: MapLibreMap;
  links: Array<MapLink>;
  modes: Map<string, ShapeMode>;
  highlightLinks: Array<MapLink>;
};

export const GlShapes = ({
  map,
  links,
  modes,
  highlightLinks,
}: GlShapesProps) => {
  useEffect(() => {
    addWildPatterns(map);

    [IDLE, ACTIVE].forEach((id) =>
      map.addSource(id, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      }),
    );

    map.addLayer(
      {
        id: 'shapes-fill',
        type: 'fill',
        source: IDLE,
        filter: kindIs('plain'),
        paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.15 },
      },
      'z-shapes',
    );
    map.addLayer(
      {
        id: 'shapes-line',
        type: 'line',
        source: IDLE,
        filter: kindIs('plain'),
        paint: {
          'line-color': ['get', 'color'],
          'line-opacity': 0.9,
          'line-width': 2,
        },
      },
      'z-shapes',
    );
    map.addLayer(
      {
        id: 'areas-grass',
        type: 'fill',
        source: IDLE,
        filter: kindIs('grass'),
        paint: { 'fill-pattern': 'wild-grass' },
      },
      'z-areas',
    );
    map.addLayer(
      {
        id: 'areas-water',
        type: 'fill',
        source: IDLE,
        filter: kindIs('water'),
        paint: { 'fill-pattern': 'wild-water' },
      },
      'z-areas',
    );
    map.addLayer(
      {
        id: 'areas-hit',
        type: 'fill',
        source: IDLE,
        filter: kindIs('whole'),
        paint: { 'fill-color': '#000', 'fill-opacity': 0 },
      },
      'z-areas',
    );

    map.addLayer(
      {
        id: 'shapes-active-fill',
        type: 'fill',
        source: ACTIVE,
        filter: [
          'all',
          kindIs('plain'),
          modeIs('hover', 'highlight', 'pinned'),
        ],
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': [
            'match',
            ['get', 'mode'],
            'hover',
            HOVER_FILL,
            'highlight',
            HIGHLIGHT_FILL,
            PINNED_FILL,
          ],
        },
      },
      'z-sprites',
    );
    map.addLayer(
      {
        id: 'shapes-active-pattern',
        type: 'fill',
        source: ACTIVE,
        filter: ['all', kindIs('grass', 'water'), modeIs('selected')],
        paint: {
          'fill-pattern': [
            'match',
            ['get', 'kind'],
            'water',
            'wild-water-hover',
            'wild-grass-hover',
          ],
        },
      },
      'z-sprites',
    );
    map.addLayer(
      {
        id: 'shapes-active-line',
        type: 'line',
        source: ACTIVE,
        filter: modeIs('selected', 'highlight'),
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 3,
        },
      },
      'z-sprites',
    );

    return () => {
      [
        'shapes-active-line',
        'shapes-active-pattern',
        'shapes-active-fill',
        'areas-hit',
        'areas-water',
        'areas-grass',
        'shapes-line',
        'shapes-fill',
      ].forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id);
      });
      [ACTIVE, IDLE].forEach((id) => {
        if (map.getSource(id)) map.removeSource(id);
      });
    };
  }, [map]);

  useEffect(() => {
    (map.getSource(IDLE) as GeoJSONSource | undefined)?.setData({
      type: 'FeatureCollection',
      features: links.filter(isShape).map((link) => featureOf(link)),
    });
  }, [map, links]);

  useEffect(() => {
    const keyed = new Map(highlightLinks.map((link) => [linkKey(link), link]));
    const features = [
      ...[...modes].flatMap(([key, mode]) => {
        const link =
          keyed.get(key) ?? links.find((entry) => linkKey(entry) === key);

        return link && isShape(link) ? [featureOf(link, mode)] : [];
      }),
    ];

    (map.getSource(ACTIVE) as GeoJSONSource | undefined)?.setData({
      type: 'FeatureCollection',
      features,
    });
  }, [map, links, modes, highlightLinks]);

  return null;
};
