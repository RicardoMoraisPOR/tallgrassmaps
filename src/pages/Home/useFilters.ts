import { useSearchParams } from 'react-router';

import { type FilterKey, type Filters, filterGroups } from './filters';

const navigateOptions = { replace: true, preventScrollReset: true };

export function useFilters() {
  const [params, setParams] = useSearchParams();

  const filters = Object.fromEntries(
    filterGroups.map(({ key }) => [key, params.getAll(key)]),
  ) as Filters;
  const active = filterGroups.some(({ key }) => filters[key].length > 0);

  const toggle = (key: FilterKey, value: string) =>
    setParams((current) => {
      const next = new URLSearchParams(current);
      const values = next.getAll(key);
      next.delete(key);
      const toggled = values.includes(value)
        ? values.filter((other) => other !== value)
        : [...values, value];
      for (const other of toggled) next.append(key, other);
      return next;
    }, navigateOptions);

  const clear = () =>
    setParams((current) => {
      const next = new URLSearchParams(current);
      for (const { key } of filterGroups) next.delete(key);
      return next;
    }, navigateOptions);

  return { filters, active, toggle, clear };
}
