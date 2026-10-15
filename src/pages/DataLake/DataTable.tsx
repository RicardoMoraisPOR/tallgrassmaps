import type { ReactNode } from 'react';

import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';

import { type Column, display, type Row, type Sort } from './table';

type DataTableProps = {
  columns: Array<Column>;
  rows: Array<Row>;
  sort: Sort | undefined;
  onSort: (column: string) => void;
  footer?: ReactNode;
};

export const DataTable = ({
  columns,
  rows,
  sort,
  onSort,
  footer,
}: DataTableProps) => {
  return (
    <div className="@container max-h-[70svh] overflow-auto rounded-xl border bg-card">
      <table className="w-full border-separate border-spacing-0 text-left text-xs">
        <thead className="sticky top-0 z-10 bg-card">
          <tr>
            {columns.map((column) => {
              const active = sort?.column === column.id;
              const Icon = !active
                ? ChevronsUpDown
                : sort.direction === 'asc'
                  ? ArrowUp
                  : ArrowDown;

              return (
                <th
                  key={column.id}
                  scope="col"
                  aria-sort={
                    active
                      ? sort.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                  className="border-b bg-muted/60 p-0 font-medium whitespace-nowrap"
                >
                  <button
                    type="button"
                    onClick={() => onSort(column.id)}
                    className={cn(
                      'flex w-full items-center gap-1.5 px-3 py-2 hover:bg-muted',
                      column.kind === 'number' && 'justify-end',
                    )}
                  >
                    {column.label}
                    <Icon
                      aria-hidden
                      className={cn(
                        'size-3.5',
                        active ? 'text-foreground' : 'text-muted-foreground/60',
                      )}
                    />
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="hover:bg-muted/40">
              {columns.map((column) => (
                <td
                  key={column.id}
                  title={display(row[column.id])}
                  className={cn(
                    'max-w-72 truncate border-b px-3 py-2',
                    column.kind === 'number' && 'text-right tabular-nums',
                  )}
                >
                  {display(row[column.id])}
                </td>
              ))}
            </tr>
          ))}
          {footer && (
            <tr>
              <td colSpan={columns.length} className="p-0">
                <div className="sticky left-0 flex w-[100cqw] justify-center p-3">
                  {footer}
                </div>
              </td>
            </tr>
          )}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-10 text-center text-muted-foreground"
              >
                Nothing matches. Try loosening a filter.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
