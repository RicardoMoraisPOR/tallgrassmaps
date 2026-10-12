import { useState } from 'react';

import { Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { fieldClass } from './fieldClass';
import {
  addFilter,
  type Column,
  type Filter,
  type Row,
  valueCounts,
} from './table';

type FilterBuilderProps = {
  columns: Array<Column>;
  rows: Array<Row>;
  filters: Array<Filter>;
  onChange: (filters: Array<Filter>) => void;
};

const describe = (filter: Filter, columns: Array<Column>) => {
  const label =
    columns.find(({ id }) => id === filter.column)?.label ?? filter.column;

  if ('equals' in filter) return `${label} is ${filter.equals}`;
  if (filter.min !== undefined && filter.max !== undefined)
    return `${label} ${filter.min}–${filter.max}`;
  if (filter.min !== undefined) return `${label} ≥ ${filter.min}`;

  return `${label} ≤ ${filter.max}`;
};

export const FilterBuilder = ({
  columns,
  rows,
  filters,
  onChange,
}: FilterBuilderProps) => {
  const filterable = columns.filter(({ kind }) => kind !== 'text');
  const [columnId, setColumnId] = useState(filterable[0]?.id ?? '');
  const [value, setValue] = useState('');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const column = filterable.find(({ id }) => id === columnId);
  const options =
    column?.kind === 'category' ? valueCounts(rows, column.id) : [];

  if (!column) return null;

  const add = () => {
    if (column.kind === 'category') {
      if (!value) return;

      onChange(addFilter(filters, { column: column.id, equals: value }));
      setValue('');

      return;
    }

    const lower = min === '' ? undefined : Number(min);
    const upper = max === '' ? undefined : Number(max);

    if (lower === undefined && upper === undefined) return;

    onChange(addFilter(filters, { column: column.id, min: lower, max: upper }));
    setMin('');
    setMax('');
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label="Filter column"
          value={columnId}
          onChange={(event) => {
            setColumnId(event.target.value);
            setValue('');
          }}
          className={fieldClass}
        >
          {filterable.map(({ id, label }) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
        {column.kind === 'category' ? (
          <select
            aria-label="Filter value"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className={`${fieldClass} max-w-56`}
          >
            <option value="">Pick a value…</option>
            {options.map(([name, count]) => (
              <option key={name} value={name}>
                {name} ({count})
              </option>
            ))}
          </select>
        ) : (
          <>
            <Input
              type="number"
              inputMode="numeric"
              aria-label="Minimum"
              placeholder="Min"
              value={min}
              onChange={(event) => setMin(event.target.value)}
              className="h-9 w-24"
            />
            <Input
              type="number"
              inputMode="numeric"
              aria-label="Maximum"
              placeholder="Max"
              value={max}
              onChange={(event) => setMax(event.target.value)}
              className="h-9 w-24"
            />
          </>
        )}
        <Button type="button" variant="outline" onClick={add}>
          <Plus aria-hidden />
          Add filter
        </Button>
      </div>
      {filters.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {filters.map((filter, index) => (
            <li key={`${describe(filter, columns)}-${index}`}>
              <button
                type="button"
                aria-label={`Remove filter: ${describe(filter, columns)}`}
                onClick={() =>
                  onChange(filters.filter((_, position) => position !== index))
                }
                className="inline-flex h-7 items-center gap-1.5 rounded-full border bg-muted px-2.5 text-xs font-medium hover:bg-muted/70"
              >
                {describe(filter, columns)}
                <X aria-hidden className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
