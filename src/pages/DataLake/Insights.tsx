import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import { fieldClass } from './fieldClass';
import {
  type Column,
  type Filter,
  numberStats,
  type Row,
  valueCounts,
} from './table';

type InsightsProps = {
  columns: Array<Column>;
  rows: Array<Row>;
  onFilter: (filter: Filter) => void;
};

const TOP_COUNT = 8;

const number = new Intl.NumberFormat('en', { maximumFractionDigits: 1 });

export const Insights = ({ columns, rows, onFilter }: InsightsProps) => {
  const categories = columns.filter(({ kind }) => kind === 'category');
  const numbers = columns.filter(({ kind }) => kind === 'number');
  const [groupBy, setGroupBy] = useState(
    categories.find(({ id }) => id !== 'game')?.id ?? categories[0]?.id,
  );
  const [statColumn, setStatColumn] = useState(numbers[0]?.id);
  const counts = useMemo(
    () => (groupBy ? valueCounts(rows, groupBy) : []),
    [rows, groupBy],
  );
  const stats = useMemo(
    () => (statColumn ? numberStats(rows, statColumn) : undefined),
    [rows, statColumn],
  );
  const [allOpen, setAllOpen] = useState(false);
  const top = counts.slice(0, TOP_COUNT);
  const widest = top[0]?.[1] ?? 1;
  const groupLabel = categories.find(({ id }) => id === groupBy)?.label;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {groupBy && (
        <section
          aria-label="Group by"
          className="flex flex-col gap-3 rounded-lg border bg-card p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">Most common</h3>
            <select
              aria-label="Group by column"
              value={groupBy}
              onChange={(event) => setGroupBy(event.target.value)}
              className={`${fieldClass} h-8`}
            >
              {categories.map(({ id, label }) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          {top.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing to count.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {top.map(([name, count]) => (
                <li key={name}>
                  <button
                    type="button"
                    title={`Filter to ${name}`}
                    onClick={() => onFilter({ column: groupBy, equals: name })}
                    className="group grid w-full grid-cols-[minmax(0,10rem)_1fr_auto] items-center gap-3 rounded-sm px-1 py-0.5 text-left text-xs hover:bg-muted"
                  >
                    <span className="truncate">{name}</span>
                    <span className="h-2 rounded-full bg-muted group-hover:bg-background">
                      <span
                        className="block h-full rounded-full bg-brand"
                        style={{ width: `${(count / widest) * 100}%` }}
                      />
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {count}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {counts.length > TOP_COUNT && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-haspopup="dialog"
              className="w-fit"
              onClick={() => setAllOpen(true)}
            >
              See all {counts.length}
            </Button>
          )}
          <AllCountsDialog
            open={allOpen}
            onOpenChange={setAllOpen}
            title={`Every ${groupLabel?.toLowerCase() ?? 'value'}`}
            counts={counts}
            onPick={(name) => {
              onFilter({ column: groupBy, equals: name });
              setAllOpen(false);
            }}
          />
        </section>
      )}
      {statColumn && (
        <section
          aria-label="Number summary"
          className="flex flex-col gap-3 rounded-lg border bg-card p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">Number crunching</h3>
            <select
              aria-label="Summarise column"
              value={statColumn}
              onChange={(event) => setStatColumn(event.target.value)}
              className={`${fieldClass} h-8`}
 >
 {numbers.map(({ id, label }) => (
 <option key={id} value={id}>
 {label}
 </option>
 ))}
 </select>
 </div>
 {stats ? (
 <dl className="grid grid-cols-3 gap-3 sm:grid-cols-5">
 {(
 [
 ['Rows', stats.count],
 ['Min', stats.min],
 ['Median', stats.median],
 ['Mean', stats.mean],
 ['Max', stats.max],
 ] as const
 ).map(([label, value]) => (
 <div key={label} className="flex flex-col">
 <dt className="text-xs text-muted-foreground">{label}</dt>
 <dd className="font-heading text-xl font-bold tabular-nums">
 {number.format(value)}
 </dd>
 </div>
 ))}
 </dl>
 ) : (
 <p className="text-sm text-muted-foreground">
 No numbers in these rows.
 </p>
 )}
 </section>
 )}
 </div>
 );
};

const AllCountsDialog = ({
 open,
 onOpenChange,
 title,
 counts,
 onPick,
}: {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 title: string;
 counts: Array<[string, number]>;
 onPick: (name: string) => void;
}) => {
 const [query, setQuery] = useState('');
 const needle = query.trim().toLowerCase();
 const shown = needle
 ? counts.filter(([name]) => name.toLowerCase().includes(needle))
 : counts;
 const widest = counts[0]?.[1] ?? 1;

 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent className="flex max-h-[85svh] flex-col gap-4 sm:max-w-lg">
 <DialogHeader>
 <DialogTitle>{title}</DialogTitle>
 <DialogDescription>
 {counts.length} values in the rows you&apos;re looking at. Pick one
 to filter by it.
 </DialogDescription>
 </DialogHeader>
 <Input
 type="search"
 value={query}
 onChange={(event) => setQuery(event.target.value)}
 placeholder="Search values…"
 aria-label="Search values"
 className="h-9"
 />
 <ul className="-mx-1 flex min-h-0 flex-col gap-1 overflow-y-auto px-1">
 {shown.map(([name, count]) => (
 <li key={name}>
 <button
 type="button"
 onClick={() => onPick(name)}
 className="group grid w-full grid-cols-[minmax(0,12rem)_1fr_auto] items-center gap-3 rounded-sm px-1 py-0.5 text-left text-xs hover:bg-muted"
 >
 <span className="truncate">{name}</span>
 <span className="h-2 rounded-full bg-muted group-hover:bg-background">
 <span
 className="block h-full rounded-full bg-brand"
 style={{ width: `${(count / widest) * 100}%` }}
                  />
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {count}
                </span>
              </button>
            </li>
          ))}
          {shown.length === 0 && (
            <li className="py-6 text-center text-sm text-muted-foreground">
              Nothing matches.
            </li>
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
};
