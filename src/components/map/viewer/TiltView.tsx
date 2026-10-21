import { useEffect } from 'react';

import type { Map as LeafletMap } from 'leaflet';
import { useMap } from 'react-leaflet';

const PERSPECTIVE_PX = 1400;
const PERSPECTIVE_ORIGIN_Y = 0.4;

export const DEFAULT_TILT_DEGREES = 40;

export const tiltFromSearch = (search: string) => {
  const value = new URLSearchParams(search).get('tilt');

  if (value === null) return undefined;

  return Number(value) || DEFAULT_TILT_DEGREES;
};

export const TiltView = ({ degrees }: { degrees: number }) => {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const place = () => {
      const { x, y } = map.getSize();

      container.style.setProperty('--tilt-origin', `${x / 2}px ${y * 0.75}px`);
    };

    container.classList.add('map-tilted');
    container.style.setProperty('--tilt-perspective', `${PERSPECTIVE_PX}px`);
    container.style.setProperty(
      '--tilt-perspective-y',
      `${PERSPECTIVE_ORIGIN_Y * 100}%`,
    );
    container.style.setProperty('--tilt', '0deg');
    place();
    map.on('resize', place);

    return () => {
      map.off('resize', place);
      container.classList.remove('map-tilted', 'map-tilt-active');
      container.style.removeProperty('--tilt');
      container.style.removeProperty('--tilt-origin');
    };
  }, [map]);

  useEffect(() => {
    const container = map.getContainer();
    const frame = requestAnimationFrame(() => {
      container.style.setProperty('--tilt', `${degrees}deg`);
      container.classList.toggle('map-tilt-active', degrees > 0);
    });

    return () => cancelAnimationFrame(frame);
  }, [map, degrees]);

  return null;
};

export const tiltedPoint = (
  map: LeafletMap,
  point: { x: number; y: number },
) => {
  const container = map.getContainer();
  const degrees = parseFloat(container.style.getPropertyValue('--tilt'));

  if (!degrees) return point;

  const originY = parseFloat(
    container.style.getPropertyValue('--tilt-origin').split(' ')[1],
  );
  const { x: width, y: height } = map.getSize();
  const radians = (degrees * Math.PI) / 180;
  const fromOrigin = point.y - originY;
  const flatY = originY + fromOrigin * Math.cos(radians);
  const scale =
    PERSPECTIVE_PX / (PERSPECTIVE_PX - fromOrigin * Math.sin(radians));
  const vanishingX = width / 2;
  const vanishingY = height * PERSPECTIVE_ORIGIN_Y;

  return {
    x: vanishingX + (point.x - vanishingX) * scale,
    y: vanishingY + (flatY - vanishingY) * scale,
  };
};
