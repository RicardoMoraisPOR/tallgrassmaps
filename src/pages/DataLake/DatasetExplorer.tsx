import { useMemo, useState } from 'react';

import { Columns3, Download, Search } from 'lucide-react';
import { useSearchParams } from 'react-router';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

import { type Dataset, rowsOf } from './datasets';
import { DataTable } from './DataTable';
import { FilterBuilder } from './FilterBuilder';
import { Insights } from './Insights';
import {
  addFilter,
  applyFilters,
  type Filter,
  searchRows,
  sortRows,
  toCsv,
} from './table';
import {
  type ExplorerState,
  readExplorerState,
  writeExplorerState,
} from './urlState';

const PAGE_SIZE = 50;

const count = new Intl.NumberFormat('en');

const download = (name: string, text: string) => {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
  const link = document.createElement('a');

  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
};

export const DatasetExplorer = ({ dataset }: { dataset: Dataset }) => {
  const rows = useMemo(() => rowsOf(dataset), [dataset]);
  const [params, setParams] = useSearchParams();
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [hidden, setHidden] = useState(
    () =>
      new Set(
        dataset.columns.filter(({ hidden }) => hidden).map(({ id }) => id),
      ),
  );

  const { query, filters, sort } = useMemo(
    () => readExplorerState(params, dataset.columns),
    [params, dataset.columns],
  );

  const update = (change: Partial<ExplorerState>) =>
    setParams(writeExplorerState(params, { query, filters, sort, ...change }), {
      replace: true,
    });
  const setQuery = (next: string) => update({ query: next });
  const setFilters = (next: Array<Filter>) => update({ filters: next });

  const filtered = useMemo(
    () => applyFilters(searchRows(rows, query), filters),
    [rows, query, filters],
  );
  const sorted = useMemo(() => sortRows(filtered, sort), [filtered, sort]);
  const columns = dataset.columns.filter(({ id }) => !hidden.has(id));
  const dirty = query !== '' || filters.length > 0;

  const toggleSort = (column: string) =>
    update({
      sort:
        sort?.column !== column
          ? { column, direction: 'asc' }
          : sort.direction === 'asc'
            ? { column, direction: 'desc' }
            : undefined,
    });

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground">{dataset.blurb}</p>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-56 flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setLimit(PAGE_SIZE);
              }}
              placeholder={`Search ${dataset.label.toLowerCase()}…`}
              aria-label={`Search ${dataset.label}`}
              className="h-9 pl-8"
            />
          </div>
          <Button
            variant="outline"
            disabled={sorted.length === 0}
            onClick={() =>
              download(`${dataset.id}.csv`, toCsv(sorted, columns))
            }
          >
            <Download aria-hidden />
            Export CSV
          </Button>
        </div>
        <FilterBuilder
          columns={dataset.columns}
          rows={rows}
          filters={filters}
          onChange={(next) => {
            setFilters(next);
            setLimit(PAGE_SIZE);
          }}
        />
      </div>
      <Insights
        columns={dataset.columns}
        rows={filtered}
        onFilter={(filter) => {
          setFilters(addFilter(filters, filter));
          setLimit(PAGE_SIZE);
        }}
      />
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <p aria-live="polite" className="tabular-nums">
              {dirty
                ? `${count.format(filtered.length)} of ${count.format(rows.length)} rows`
                : `${count.format(rows.length)} rows`}
            </p>
            {dirty && (
              <button
                type="button"
                onClick={() => {
                  update({ query: '', filters: [] });
                }}
                className="text-foreground underline underline-offset-3"
              >
                Clear search and filters
              </button>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns3 aria-hidden />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-80 w-52">
              {dataset.columns.map(({ id, label }) => (
                <DropdownMenuCheckboxItem
                  key={id}
                  checked={!hidden.has(id)}
                  onSelect={(event) => event.preventDefault()}
                  onCheckedChange={(checked) =>
                    setHidden((current) => {
                      const next = new Set(current);

                      if (checked) next.delete(id);
                      else next.add(id);

                      return next;
                    })
                  }
                >
                  {label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <DataTable
          columns={columns}
          rows={sorted.slice(0, limit)}
          sort={sort}
          onSort={toggleSort}
          footer={
            sorted.length > limit && (
              <Button
                variant="outline"
                onClick={() => setLimit((current) => current + PAGE_SIZE * 4)}
              >
                Show more ({count.format(sorted.length - limit)} left)
              </Button>
            )
          }
        />
      </div>
    </div>
  );
};
