import type { Place } from './places';

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

export const placeMatches = (place: Place, query: string) => {
  const search = normalize(query);

  return (
    !search ||
    normalize(place.location.name).includes(search) ||
    place.location.locations.some((child) =>
      normalize(child.name).includes(search),
    )
  );
};

const rank = (place: Place, search: string) => {
  const name = normalize(place.location.name);

  if (name === search) return 0;
  if (name.startsWith(search)) return 1;
  if (name.split(/\s+/).some((word) => word.startsWith(search))) return 2;
  if (name.includes(search)) return 3;

  return 4;
};

export const searchPlaces = (places: Array<Place>, query: string) => {
  const search = normalize(query);

  if (!search) return places;

  return places
    .filter((place) => placeMatches(place, search))
    .toSorted((a, b) => rank(a, search) - rank(b, search));
};
