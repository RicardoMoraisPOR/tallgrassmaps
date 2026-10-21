import type { Map as MapLibreMap } from 'maplibre-gl';

import { BASE_ZOOM, toLngLat } from './projection';
import { spriteImageName } from './spriteImages';
import type { WorldData } from './worldData';

export type LayerGroup = 'sprites' | 'icons' | 'dots' | 'areas';

type Feature<Geometry> = {
  type: 'Feature';
  properties: Record<string, string | number>;
  geometry: Geometry;
};

type Point = { type: 'Point'; coordinates: [number, number] };

type Polygon = {
  type: 'Polygon';
  coordinates: Array<Array<[number, number]>>;
};

type FeatureCollection<Geometry> = {
  type: 'FeatureCollection';
  features: Array<Feature<Geometry>>;
};

const MIN_ZOOM = 5;
const MAX_ZOOM = 18;
const FADED_OPACITY = 0.5;
const ICON_RADIUS = 7;
const DOT_RADIUS = 4;
const MAX_DOT_SIZE = 32;

const layerColors: Record<string, string> = {
  connections: '#38c172',
  buildings: '#f59e0b',
  services: '#ef4444',
  items: '#06b6d4',
  'hidden-items': '#d946ef',
  trainers: '#eab308',
  'static-pokemon': '#14b8a6',
  'wild-pokemon': '#84cc16',
  'wild-badges': '#84cc16',
  npcs: '#6366f1',
  'special-npcs': '#a78bfa',
  signs: '#9ca3af',
};

const colorOf = (layer: string) => layerColors[layer] ?? '#ffffff';

const point = (
  x: number,
  y: number,
  properties: Record<string, string | number>,
): Feature<Point> => ({
  type: 'Feature',
  properties,
  geometry: { type: 'Point', coordinates: toLngLat(x, y) },
});

export const layerGroups: Array<LayerGroup> = [
  'sprites',
  'icons',
  'dots',
  'areas',
];

export const worldBounds = (
  data: WorldData,
): [[number, number], [number, number]] => [
  toLngLat(0, data.height),
  toLngLat(data.width, 0),
];

export const addWorldLayers = (map: MapLibreMap, data: WorldData) => {
  data.floors.forEach((floor) => {
    const { x, y, width, height } = floor;

    map.addSource(`floor-${floor.id}`, {
      type: 'image',
      url: floor.image,
      coordinates: [
        toLngLat(x, y),
        toLngLat(x + width, y),
        toLngLat(x + width, y + height),
        toLngLat(x, y + height),
      ],
    });
    map.addLayer({
      id: `floor-${floor.id}`,
      type: 'raster',
      source: `floor-${floor.id}`,
      paint: { 'raster-resampling': 'nearest', 'raster-fade-duration': 0 },
    });
  });

  const areas: FeatureCollection<Polygon> = {
    type: 'FeatureCollection',
    features: data.links
      .filter((link) => link.layer === 'wild-pokemon' && link.outline)
      .flatMap((link) =>
        (link.outline ?? []).map((ring): Feature<Polygon> => ({
          type: 'Feature',
          properties: { label: link.label },
          geometry: {
            type: 'Polygon',
            coordinates: [[...ring, ring[0]].map(([x, y]) => toLngLat(x, y))],
          },
        })),
      ),
  };

  const sprites: FeatureCollection<Point> = {
    type: 'FeatureCollection',
    features: data.links.flatMap((link) =>
      link.sprite
        ? [
            point(link.x + link.width / 2, link.y + link.height, {
              image: spriteImageName(
                link.sprite.src,
                link.sprite.facing,
                link.width,
                link.height,
              ),
              opacity: link.sprite.faded ? FADED_OPACITY : 1,
              sort: link.y + link.height,
              label: link.label,
            }),
          ]
        : [],
    ),
  };

  const icons: FeatureCollection<Point> = {
    type: 'FeatureCollection',
    features: data.links.flatMap((link) =>
      link.icon
        ? [
            point(link.x + link.width / 2, link.y + link.height / 2, {
              color: colorOf(link.layer),
              label: link.label,
            }),
          ]
        : [],
    ),
  };

  const dots: FeatureCollection<Point> = {
    type: 'FeatureCollection',
    features: data.links.flatMap((link) =>
      !link.sprite &&
      !link.icon &&
      !link.outline &&
      link.layer !== 'wild-pokemon' &&
      link.width <= MAX_DOT_SIZE
        ? [
            point(link.x + link.width / 2, link.y + link.height / 2, {
              color: colorOf(link.layer),
              label: link.label,
            }),
          ]
        : [],
    ),
  };

  map.addSource('areas', { type: 'geojson', data: areas });
  map.addSource('sprites', { type: 'geojson', data: sprites });
  map.addSource('icons', { type: 'geojson', data: icons });
  map.addSource('dots', { type: 'geojson', data: dots });

  map.addLayer({
    id: 'areas',
    type: 'fill',
    source: 'areas',
    paint: { 'fill-color': '#84cc16', 'fill-opacity': 0.25 },
  });
  map.addLayer({
    id: 'dots',
    type: 'circle',
    source: 'dots',
    paint: {
      'circle-radius': DOT_RADIUS,
      'circle-color': ['get', 'color'],
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 1,
      'circle-pitch-alignment': 'viewport',
    },
  });
  map.addLayer({
    id: 'icons',
    type: 'circle',
    source: 'icons',
    paint: {
      'circle-radius': ICON_RADIUS,
      'circle-color': ['get', 'color'],
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 1.5,
      'circle-pitch-alignment': 'viewport',
    },
  });
  map.addLayer({
    id: 'sprites',
    type: 'symbol',
    source: 'sprites',
    layout: {
      'icon-image': ['get', 'image'],
      'icon-anchor': 'bottom',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'icon-pitch-alignment': 'viewport',
      'icon-rotation-alignment': 'viewport',
      'symbol-sort-key': ['get', 'sort'],
      'icon-size': [
        'interpolate',
        ['exponential', 2],
        ['zoom'],
        MIN_ZOOM,
        2 ** (MIN_ZOOM - BASE_ZOOM),
        MAX_ZOOM,
        2 ** (MAX_ZOOM - BASE_ZOOM),
      ],
    },
    paint: { 'icon-opacity': ['get', 'opacity'] },
  });

  return {
    counts: {
      floors: data.floors.length,
      sprites: sprites.features.length,
      icons: icons.features.length,
      dots: dots.features.length,
      areas: areas.features.length,
    },
  };
};

export const setGroupVisible = (
  map: MapLibreMap,
  group: LayerGroup,
  visible: boolean,
) => map.setLayoutProperty(group, 'visibility', visible ? 'visible' : 'none');

export const worldZoomLimits = { minZoom: MIN_ZOOM, maxZoom: MAX_ZOOM };
