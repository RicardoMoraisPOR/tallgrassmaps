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

  const matches = (text: string) =>
    tokens.every((token) => text.includes(token));

  return battles
    .map((listed) => ({
      listed,
      name: normalize(listed.battle.name),
      title: normalize(listed.battle.title ?? ''),
    }))
    .filter(({ name, title }) => matches(`${name} ${title}`))
    .toSorted(
      (a, b) =>
        (matches(a.name) ? rank(a.name, search) : 4) -
        (matches(b.name) ? rank(b.name, search) : 4),
    )
    .map(({ listed }) => listed);
};
