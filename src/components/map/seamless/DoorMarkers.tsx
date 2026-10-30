import { useEffect, useEffectEvent } from 'react';

import { Map as MapLibreMap, Marker } from 'maplibre-gl';

import { useThemeStyle } from '@/components/settings/themes';

import { toLngLat } from '../gl/glCoordinates';
import { mapIconArt, zaDoorArt } from '../viewer/iconArt';

const DOOR_SIZE = 30;

export const DoorMarkers = ({
  map,
  doors,
}: {
  map: MapLibreMap;
  doors: Array<[number, number]>;
}) => {
  const style = useThemeStyle('mapIcons');
  const doorsKey = doors.map(([x, y]) => `${x},${y}`).join('|');

  const placeDoors = useEffectEvent(() => {
    const markers = doors.map(([x, y]) => {
      const element = document.createElement('div');

      element.className = 'map-icon-anchor';
      element.style.cssText = `display:grid;width:${DOOR_SIZE}px;height:${DOOR_SIZE}px;pointer-events:none`;
      element.innerHTML =
        style === 'game'
          ? `<span class="map-icon map-icon-za">${zaDoorArt}</span>`
          : `<span class="map-icon map-link-entrance">${mapIconArt.door['tall-grass']}</span>`;

      return new Marker({ element, anchor: 'center' })
        .setLngLat(toLngLat(x, y))
        .addTo(map);
    });

    return () => markers.forEach((marker) => marker.remove());
  });

  useEffect(() => placeDoors(), [map, style, doorsKey]);

  return null;
};
