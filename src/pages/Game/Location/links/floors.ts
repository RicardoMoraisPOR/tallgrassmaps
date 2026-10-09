import type { Location, LocationFloor } from '@/data/maps';

export type FloorStep = 'up' | 'down';

export const floorStep = (
  location: Location,
  from: LocationFloor | undefined,
  to: string,
): FloorStep => {
  const floors = location.floors ?? [];
  const level = (id?: string) => {
    const [, basement, number] = id?.match(/^(b?)(\d+)f$/) ?? [];

    if (number) return basement ? -Number(number) : Number(number);

    return floors.length + floors.findIndex((entry) => entry.id === id);
  };

  return level(to) > level(from?.id) ? 'up' : 'down';
};

export const floorName = (location: Location, id: string) =>
  location.floors?.find((entry) => entry.id === id)?.name ?? id;

export const floorLabel = (location: Location, step: FloorStep, to: string) =>
  `${step === 'up' ? 'Up' : 'Down'} to ${floorName(location, to)}`;
