import { cn } from '@/lib/utils';

import { type Priority, priorityLabels } from './priorities';

const priorityStyles: Record<Priority, string> = {
  high: 'border-destructive text-destructive',
  medium: 'border-brand text-brand',
  low: 'text-muted-foreground',
};

type TodoRowProps = {
  text: string;
  priority: Priority;
  done: boolean;
  onToggle: () => void;
  leading?: string;
  section?: string;
};

export const TodoRow = ({
  text,
  priority,
  done,
  onToggle,
  leading,
  section,
}: TodoRowProps) => {
  return (
    <li className="flex items-start gap-3">
      {leading && (
        <span className="mt-0.5 w-6 shrink-0 text-right text-sm text-muted-foreground tabular-nums">
          {leading}
        </span>
      )}
      <label className="flex flex-1 cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={done}
          onChange={onToggle}
          className="mt-1 size-4 shrink-0 accent-brand"
        />
        <span className="flex flex-col gap-0.5">
          <span
            className={cn(
              'text-pretty',
              done && 'text-muted-foreground line-through',
            )}
          >
            {text}
          </span>
          {section && (
            <span className="text-xs text-muted-foreground">{section}</span>
          )}
        </span>
      </label>
      <span
        className={cn(
          'shrink-0 rounded-sm border px-1.5 py-0.5 text-xs',
          priorityStyles[priority],
        )}
      >
        {priorityLabels[priority]}
      </span>
    </li>
  );
};
