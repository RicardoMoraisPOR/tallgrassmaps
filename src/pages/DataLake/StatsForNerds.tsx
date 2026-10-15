import { useEffect, useMemo, useRef, useState } from 'react';

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { DESKTOP_QUERY } from '@/lib/breakpoints';
import { cn } from '@/lib/utils';

import { type NerdStat, nerdStats } from './nerdStats';
import { useDecode } from './useDecode';

const ROW_STAGGER_MS = 220;
const TABLET_QUERY_MIN = '(min-width: 640px)';
const DECODE_MS = 900;

export const StatsForNerds = () => {
  const stats = useMemo(() => nerdStats(), []);
  const grid = useRef<HTMLDListElement>(null);
  const [started, setStarted] = useState(false);
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const tablet = useMediaQuery(TABLET_QUERY_MIN);
  const columns = desktop ? 4 : tablet ? 3 : 2;

  useEffect(() => {
    const element = grid.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setStarted(true);
        observer.disconnect();
      },
      { threshold: 0.2 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      aria-labelledby="nerd-stats-heading"
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <h2
          id="nerd-stats-heading"
          className="text-xs font-semibold tracking-[0.14em] text-brand uppercase"
        >
          Stats for nerds
        </h2>
      </div>
      <div className="relative overflow-hidden rounded-lg border">
        <dl
          ref={grid}
          className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-4"
        >
          {stats.map((stat, index) => (
            <StatTile
              key={stat.label}
              stat={stat}
              start={started}
              delayMs={Math.floor(index / columns) * ROW_STAGGER_MS}
            />
          ))}
        </dl>
        {started && (
          <div
            aria-hidden
            className="nerd-scan pointer-events-none absolute inset-x-0 top-0 h-full bg-linear-to-b from-transparent via-brand/20 to-transparent motion-reduce:hidden"
          />
        )}
      </div>
    </section>
  );
};

const corners = [
  'top-3 left-3 border-t-2 border-l-2 group-hover:top-1.5 group-hover:left-1.5',
  'top-3 right-3 border-t-2 border-r-2 group-hover:top-1.5 group-hover:right-1.5',
  'bottom-3 left-3 border-b-2 border-l-2 group-hover:bottom-1.5 group-hover:left-1.5',
  'right-3 bottom-3 border-r-2 border-b-2 group-hover:right-1.5 group-hover:bottom-1.5',
];

const StatTile = ({
  stat,
  start,
  delayMs,
}: {
  stat: NerdStat;
  start: boolean;
  delayMs: number;
}) => {
  const value = useDecode(stat.value, start, delayMs, DECODE_MS);
  const details = [stat.detail ?? []].flat();

  return (
    <div
      className={cn(
        'group relative flex flex-col gap-1 overflow-hidden bg-card p-4 transition-[opacity,background-color] hover:bg-brand/5',
        !start && 'opacity-0',
      )}
      style={{
        transitionDelay: `${delayMs}ms, 0ms`,
        transitionDuration: '300ms, 100ms',
      }}
    >
      {corners.map((corner) => (
        <span
          key={corner}
          aria-hidden
          className={cn(
            'pointer-events-none absolute size-2 border-brand opacity-0 transition-all duration-200 group-hover:opacity-100',
            corner,
          )}
        />
      ))}
      <dt className="text-xs text-muted-foreground">{stat.label}</dt>
      <dd className="flex flex-col gap-0.5">
        <span
          aria-label={stat.value}
          className={cn(
            'font-mono text-2xl font-bold tracking-[-0.02em] tabular-nums transition-colors duration-300',
            value.decoding && 'text-brand',
          )}
        >
          <span aria-hidden>{value.text}</span>
        </span>
        {details.map((line, index) => (
          <StatLine
            key={line}
            text={line}
            start={start}
            delayMs={delayMs + 300 + index * 150}
          />
        ))}
      </dd>
    </div>
  );
};

const StatLine = ({
  text,
  start,
  delayMs,
}: {
  text: string;
  start: boolean;
  delayMs: number;
}) => {
  const line = useDecode(text, start, delayMs, DECODE_MS);

  return (
    <span
      aria-label={text}
      className="font-mono text-xs text-pretty text-muted-foreground"
    >
      <span aria-hidden>{line.text}</span>
    </span>
  );
};
