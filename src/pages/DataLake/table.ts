export type Value = string | number | Array<string> | undefined;

export type Row = Record<string, Value>;

export type ColumnKind = 'text' | 'number' | 'category';

export type Column = {
  id: string;
  label: string;
  kind: ColumnKind;
  hidden?: boolean;
};

export type Filter =
  | { column: string; equals: string }
  | { column: string; min?: number; max?: number };

export type Sort = { column: string; direction: 'asc' | 'desc' };

export const display = (value: Value) =>
  Array.isArray(value) ? value.join(', ') : (value?.toString() ?? '');

const valuesOf = (value: Value) =>
  Array.isArray(value) ? value : value === undefined ? [] : [display(value)];

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

export const searchRows = (rows: Array<Row>, query: string) => {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);

  if (tokens.length === 0) return rows;

  return rows.filter((row) => {
    const text = normalize(Object.values(row).map(display).join(' '));

    return tokens.every((token) => text.includes(token));
  });
};

const sameFilter = (a: Filter, b: Filter) =>
  a.column === b.column &&
  ('equals' in a
    ? 'equals' in b && a.equals === b.equals
    : !('equals' in b) && a.min === b.min && a.max === b.max);

export const addFilter = (filters: Array<Filter>, filter: Filter) =>
  filters.some((existing) => sameFilter(existing, filter))
    ? filters
    : [...filters, filter];

const matches = (row: Row, filter: Filter) => {
  const value = row[filter.column];

  if ('equals' in filter) return valuesOf(value).includes(filter.equals);

  if (typeof value !== 'number') return false;

  return (
    (filter.min === undefined || value >= filter.min) &&
    (filter.max === undefined || value <= filter.max)
  );
};

export const applyFilters = (rows: Array<Row>, filters: Array<Filter>) =>
  filters.length === 0
    ? rows
    : rows.filter((row) => filters.every((filter) => matches(row, filter)));

export const sortRows = (rows: Array<Row>, sort: Sort | undefined) => {
  if (!sort) return rows;

  const factor = sort.direction === 'asc' ? 1 : -1;

  return rows.toSorted((a, b) => {
    const left = a[sort.column];
    const right = b[sort.column];

    if (left === undefined || left === '') return 1;
    if (right === undefined || right === '') return -1;

    if (typeof left === 'number' && typeof right === 'number') {
      return (left - right) * factor;
    }

    return (
      display(left).localeCompare(display(right), undefined, {
        numeric: true,
        sensitivity: 'base',
      }) * factor
    );
  });
};

export const valueCounts = (rows: Array<Row>, column: string) => {
  const counts = new Map<string, number>();

  for (const row of rows) {
    for (const value of new Set(valuesOf(row[column]))) {
      if (value !== '') counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }

  return [...counts.entries()].toSorted(
    ([nameA, countA], [nameB, countB]) =>
      countB - countA ||
      nameA.localeCompare(nameB, undefined, { numeric: true }),
  );
};

export const numberStats = (rows: Array<Row>, column: string) => {
  const numbers = rows
    .map((row) => row[column])
    .filter((value): value is number => typeof value === 'number');

  if (numbers.length === 0) return undefined;

  const sorted = numbers.toSorted((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return {
    count: numbers.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean: numbers.reduce((sum, value) => sum + value, 0) / numbers.length,
    median:
      sorted.length % 2 === 0
        ? (sorted[middle - 1] + sorted[middle]) / 2
        : sorted[middle],
  };
};

const csvCell = (text: string) =>
  /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;

export const toCsv = (rows: Array<Row>, columns: Array<Column>) =>
  [
    columns.map(({ label }) => csvCell(label)).join(','),
    ...rows.map((row) =>
      columns.map(({ id }) => csvCell(display(row[id]))).join(','),
    ),
  ].join('\n');
