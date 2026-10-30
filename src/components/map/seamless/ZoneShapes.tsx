import { useEffect, useEffectEvent } from 'react';

import { type GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';

import { hotspotBorder } from '../coordinates';
import { toLngLat } from '../gl/glCoordinates';
import { type Zone } from './zoneGeometry';

const BORDER_WEIGHT = 2;
const SELECTED_WEIGHT = BORDER_WEIGHT * 1.5;
const DOT_GAP = 3;
const GLOW_BLUR = 6;
const GLOW_WIDTH = 10;
const GLOW_STRENGTH = 0.7;
const SELECTED_OPACITY = 0.2;
const IDLE_OPACITY = 0.5;
const HOVER_OPACITY = 0.85;
const DEFAULT_COLOR = '#49ea82';
const ZONES = 'zones';

type ZoneShapesProps = {
  map: MapLibreMap;
  zones: Array<Zone>;
  selected?: string;
  onSelect: (target: string) => void;
  onHover: (hover?: { name: string; x: number; y: number }) => void;
};

export const ZoneShapes = ({
  map,
  zones,
  selected,
  onSelect,
  onHover,
}: ZoneShapesProps) => {
  const select = useEffectEvent((target: string) => onSelect(target));
  const hover = useEffectEvent(
    (value?: { name: string; x: number; y: number }) => onHover(value),
  );

  useEffect(() => {
    map.addSource(ZONES, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });

    map.addLayer(
      {
        id: 'zones-glow',
        type: 'line',
        source: ZONES,
        filter: ['==', ['get', 'selected'], true],
        layout: { 'line-join': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': GLOW_WIDTH,
          'line-blur': GLOW_BLUR,
          'line-opacity': GLOW_STRENGTH,
        },
      },
      'z-shapes',
    );
    map.addLayer(
      {
        id: 'zones-fill',
        type: 'fill',
        source: ZONES,
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': [
            'case',
            ['get', 'selected'],
            SELECTED_OPACITY,
            ['boolean', ['feature-state', 'hover'], false],
            HOVER_OPACITY,
            ['get', 'dimmed'],
            0,
            IDLE_OPACITY,
          ],
        },
      },
      'z-shapes',
    );
    map.addLayer(
      {
        id: 'zones-line',
        type: 'line',
        source: ZONES,
        filter: ['!', ['get', 'dimmed']],
        layout: { 'line-join': 'round', 'line-cap': 'butt' },
        paint: {
          'line-color': ['get', 'border'],
          'line-width': [
            'case',
            ['get', 'selected'],
            SELECTED_WEIGHT,
            BORDER_WEIGHT,
          ],
        },
      },
      'z-shapes',
    );
    map.addLayer(
      {
        id: 'zones-line-dotted',
        type: 'line',
        source: ZONES,
        filter: ['get', 'dimmed'],
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': ['get', 'border'],
          'line-width': BORDER_WEIGHT,
          'line-dasharray': [0.05, DOT_GAP],
        },
      },
      'z-shapes',
    );

    let hovered: number | undefined;

    const clear = () => {
      if (hovered !== undefined)
        map.setFeatureState({ source: ZONES, id: hovered }, { hover: false });

      hovered = undefined;
      map.getCanvas().style.cursor = '';
      hover(undefined);
    };

    const onMove = (event: {
      point: { x: number; y: number };
      features?: Array<{
        id?: string | number;
        properties: Record<string, unknown>;
      }>;
    }) => {
      const feature = event.features?.[0];

      if (!feature || feature.properties.selected === true) {
        clear();

        return;
      }

      const id = Number(feature.id);

      if (hovered !== id) {
        if (hovered !== undefined)
          map.setFeatureState({ source: ZONES, id: hovered }, { hover: false });

        map.setFeatureState({ source: ZONES, id }, { hover: true });
        hovered = id;
      }

      map.getCanvas().style.cursor = 'pointer';
      hover({
        name: String(feature.properties.name),
        x: event.point.x,
        y: event.point.y,
      });
    };

    const onClick = (event: {
      features?: Array<{ properties: Record<string, unknown> }>;
    }) => {
      const feature = event.features?.[0];

      if (feature && feature.properties.selected !== true)
        select(String(feature.properties.target));
    };

    map.on('mousemove', 'zones-fill', onMove);
    map.on('mouseleave', 'zones-fill', clear);
    map.on('click', 'zones-fill', onClick);

    return () => {
      map.off('mousemove', 'zones-fill', onMove);
      map.off('mouseleave', 'zones-fill', clear);
      map.off('click', 'zones-fill', onClick);
      ['zones-line-dotted', 'zones-line', 'zones-fill', 'zones-glow'].forEach(
        (id) => {
          if (map.getLayer(id)) map.removeLayer(id);
        },
      );

      if (map.getSource(ZONES)) map.removeSource(ZONES);
    };
  }, [map]);

  useEffect(() => {
    (map.getSource(ZONES) as GeoJSONSource | undefined)?.setData({
      type: 'FeatureCollection',
      features: zones.map((zone) => {
        const color = zone.hotspot.color ?? DEFAULT_COLOR;
        const isSelected = zone.target === selected;

        return {
          type: 'Feature' as const,
          id: zone.index,
          properties: {
            target: zone.target,
            name: zone.name,
            color,
            border: hotspotBorder(color),
            selected: isSelected,
            dimmed: selected !== undefined && !isSelected,
          },
          geometry: {
            type: 'Polygon' as const,
            coordinates: [
              [...zone.hotspot.shape, zone.hotspot.shape[0]].map(([x, y]) =>
                toLngLat(x, y),
              ),
            ],
          },
        };
      }),
    });
  }, [map, zones, selected]);

  return null;
};
