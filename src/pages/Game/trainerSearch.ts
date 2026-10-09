import type { ListedBattle } from './Location/trainerList';
import { normalize } from './placeSearch';

const rank = (name: string, search: string) => {
  if (name === search) return 0;
  if (name.startsWith(search)) return 1;
  if (name.split(/\s+/).some((word) => word.startsWith(search))) return 2;

  return 3;
};

export const searchTrainers = (battles: Array<ListedBattle>, query: string) => {
  const search = normalize(query);

  if (!search) return battles;

  const tokens = search.split(/\s+/);

  return battles
    .map((listed) => ({ listed, name: normalize(listed.battle.name) }))
    .filter(({ name }) => tokens.every((token) => name.includes(token)))
    .toSorted((a, b) => rank(a.name, search) - rank(b.name, search))
    .map(({ listed }) => listed);
};
