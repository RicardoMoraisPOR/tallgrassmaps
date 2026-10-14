import { useSearchParams } from 'react-router';

import {
  type FilterKey,
  type Filters,
  filterGroups,
  groupsFor,
  type MapsView,
} from './filters';

export type { MapsView };

const navigateOptions = { replace: true, preventScrollReset: true };

export const useFilters = () => {
  const [params, setParams] = useSearchParams();

  const view: MapsView =
    params.get('view') === 'generation' ? 'generation' : 'map';
  const groups = groupsFor(view);
  const filters = Object.fromEntries(
    filterGroups.map(({ key }) => [
      key,
      groups.some((group) => group.key === key) ? params.getAll(key) : [],
    ]),
  ) as Filters;
  const active = groups.some(({ key }) => filters[key].length > 0);

  const toggle = (key: FilterKey, value: string) =>
    setParams((current) => {
      const next = new URLSearchParams(current);
      const values = next.getAll(key);
      const toggled = values.includes(value)
        ? values.filter((other) => other !== value)
        : [...values, value];

      next.delete(key);
      for (const other of toggled) next.append(key, other);

      return next;
    }, navigateOptions);

  const setView = (next: MapsView) =>
    setParams((current) => {
      const updated = new URLSearchParams(current);

      if (next === 'map') updated.delete('view');
      else updated.set('view', next);

      updated.delete(next === 'map' ? 'map' : 'generation');

      return updated;
    }, navigateOptions);

  const clear = () =>
    setParams((current) => {
      const next = new URLSearchParams(current);

      for (const { key } of filterGroups) next.delete(key);

      return next;
    }, navigateOptions);

  return { filters, groups, active, view, setView, toggle, clear };
};
