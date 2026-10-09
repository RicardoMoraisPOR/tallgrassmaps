import type { Place } from './places';

export const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

const tokensOf = (query: string) =>
  normalize(query).split(/\s+/).filter(Boolean);

export const placeMatches = (place: Place, query: string, parent = '') => {
  const text = normalize(`${place.location.name} ${parent}`);

  return tokensOf(query).every((token) => text.includes(token));
};

const rank = (place: Place, tokens: Array<string>) => {
  const name = normalize(place.location.name);
  const search = tokens.join(' ');

  if (name === search) return 0;
  if (name.startsWith(search)) return 1;
  if (
    tokens.every((token) =>
      name.split(/\s+/).some((word) => word.startsWith(token)),
    )
  )
    return 2;
  if (tokens.every((token) => name.includes(token))) return 3;

  return 4;
};

export const searchPlaces = (
  places: Array<Place>,
  query: string,
  parentOf: (place: Place) => string | undefined = () => undefined,
) => {
  const tokens = tokensOf(query);

  if (tokens.length === 0) return places;

  return places
    .filter((place) => placeMatches(place, query, parentOf(place)))
    .toSorted((a, b) => rank(a, tokens) - rank(b, tokens));
};
