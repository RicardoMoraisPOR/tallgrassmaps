import type { CityMap, HeroCity } from './heroCities';

const LABEL_CHARACTER_PIXELS = 8.4;
const LABEL_EDGE_PIXELS = 12;

export type CityPin = {
  id: number;
  name: string;
  map?: CityMap;
  x: number;
  y: number;
  labelShift: number;
};

export const createCityPin = (
  id: number,
  city: HeroCity,
  point: { x: number; y: number },
  containerWidth: number,
): CityPin => {
  const halfLabel = (city.name.length * LABEL_CHARACTER_PIXELS) / 2;
  const center = Math.min(
    Math.max(point.x, halfLabel + LABEL_EDGE_PIXELS),
    containerWidth - halfLabel - LABEL_EDGE_PIXELS,
  );

  return {
    id,
    name: city.name,
    map: city.map,
    x: point.x,
    y: point.y,
    labelShift: center - point.x,
  };
};
