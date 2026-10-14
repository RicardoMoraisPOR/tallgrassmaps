import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

type VirtualGridProps<T> = {
  items: Array<T>;
  itemKey: (item: T) => string | number;
  renderItem: (item: T, index: number) => ReactNode;
  minColumnWidth: number;
  rowHeight: number;
  gap: number;
  overscan?: number;
  className?: string;
};

type Layout = { columns: number; firstRow: number; lastRow: number };

export const VirtualGrid = <T,>({
  items,
  itemKey,
  renderItem,
  minColumnWidth,
  rowHeight,
  gap,
  overscan = 600,
  className,
}: VirtualGridProps<T>) => {
  const container = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<Layout>({
    columns: 1,
    firstRow: 0,
    lastRow: 0,
  });

  const measure = useCallback(() => {
    const element = container.current;

    if (!element) return;

    const columns = Math.max(
      1,
      Math.floor((element.clientWidth + gap) / (minColumnWidth + gap)),
    );
    const stride = rowHeight + gap;
    const top = element.getBoundingClientRect().top;
    const visibleStart = Math.max(0, -top - overscan);
    const visibleEnd = -top + window.innerHeight + overscan;
    const rows = Math.ceil(items.length / columns);
    const firstRow = Math.min(rows, Math.floor(visibleStart / stride));
    const lastRow = Math.min(rows, Math.ceil(visibleEnd / stride));

    setLayout((current) =>
      current.columns === columns &&
      current.firstRow === firstRow &&
      current.lastRow === lastRow
        ? current
        : { columns, firstRow, lastRow },
    );
  }, [items.length, minColumnWidth, rowHeight, gap, overscan]);

  useLayoutEffect(measure, [measure]);

  useEffect(() => {
    const element = container.current;
    let frame = 0;

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);

    if (element) observer.observe(element);

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [measure]);

  const { columns, firstRow, lastRow } = layout;
  const stride = rowHeight + gap;
  const rows = Math.ceil(items.length / columns);
  const visible = items.slice(firstRow * columns, lastRow * columns);

  return (
    <div
      ref={container}
      className={className}
      style={{ height: Math.max(0, rows * stride - gap), position: 'relative' }}
    >
      <ul
        className="absolute inset-x-0 grid"
        style={{
          top: firstRow * stride,
          gap,
          gridAutoRows: rowHeight,
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }}
      >
        {visible.map((item, index) => (
          <li key={itemKey(item)} className="min-w-0">
            {renderItem(item, index)}
          </li>
        ))}
      </ul>
    </div>
  );
};
