import { addFilter, type Column, type Filter, type Sort } from './table';
import { versionGroupLabel } from './versionGroups';

export type ExplorerState = {
  query: string;
  filters: Array<Filter>;
  sort?: Sort;
};

const RANGE = '..';

const parseNumber = (text: string) => {
  if (text.trim() === '') return undefined;

  const value = Number(text);

  return Number.isFinite(value) ? value : undefined;
};

const parseFilter = (
  raw: string,
  columns: Array<Column>,
): Filter | undefined => {
  const split = raw.indexOf(':');
  const column = columns.find(({ id }) => id === raw.slice(0, split));
  const value = raw.slice(split + 1);

  if (split < 1 || !column || column.kind === 'text') return undefined;

  if (column.kind === 'category') return { column: column.id, equals: value };

  const [min, max] = value.split(RANGE);
  const filter = {
    column: column.id,
    min: parseNumber(min),
    max: parseNumber(max ?? ''),
  };

  return filter.min === undefined && filter.max === undefined
    ? undefined
    : filter;
};

const serializeFilter = (filter: Filter) => {
  if ('equals' in filter) return `${filter.column}:${filter.equals}`;

  return `${filter.column}:${filter.min ?? ''}${RANGE}${filter.max ?? ''}`;
};

export const readExplorerState = (
  params: URLSearchParams,
  columns: Array<Column>,
): ExplorerState => {
  const [sortColumn, direction] = (params.get('sort') ?? '').split(':');
  const sortable = columns.some(({ id }) => id === sortColumn);

  return {
    query: params.get('q') ?? '',
    filters: params
      .getAll('f')
      .map((raw) => parseFilter(raw, columns))
      .filter((filter): filter is Filter => Boolean(filter))
      .reduce<Array<Filter>>(addFilter, []),
    sort:
      sortable && (direction === 'asc' || direction === 'desc')
        ? { column: sortColumn, direction }
        : undefined,
  };
};

export const writeExplorerState = (
  params: URLSearchParams,
  { query, filters, sort }: ExplorerState,
) => {
  const next = new URLSearchParams(params);

  next.delete('q');
  next.delete('f');
  next.delete('sort');

  if (query) next.set('q', query);

  filters.forEach((filter) => next.append('f', serializeFilter(filter)));

  if (sort) next.set('sort', `${sort.column}:${sort.direction}`);

  return next;
};

export const dataLakeHref = (versionGroup: string) => {
  const label = versionGroupLabel(versionGroup);

  return label
    ? `/data-lake?${writeExplorerState(new URLSearchParams(), {
        query: '',
        filters: [{ column: 'game', equals: label }],
      })}`
    : '/data-lake';
};
