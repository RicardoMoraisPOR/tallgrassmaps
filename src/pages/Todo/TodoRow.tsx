import { cn } from '@/lib/utils';

import { type Owner, ownerLabels } from './owners';
import { type Priority, priorityLabels } from './priorities';

const priorityStyles: Record<Priority, string> = {
  high: 'border-destructive text-destructive',
  medium: 'border-brand text-brand',
  low: 'text-muted-foreground',
};

const ownerStyles: Record<Owner, string> = {
  ai: 'text-foreground',
  human: 'border-foreground bg-foreground text-background',
};

type TodoRowProps = {
  text: string;
  priority: Priority;
  owner: Owner;
  leading?: string;
  section?: string;
};

export const TodoRow = ({
  text,
  priority,
  owner,
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
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="text-pretty">{text}</span>
        {section && (
          <span className="text-xs text-muted-foreground">{section}</span>
        )}
      </span>
      <span className="flex shrink-0 items-center gap-1.5">
        <span
          className={cn(
            'rounded-sm border px-1.5 py-0.5 text-xs',
            ownerStyles[owner],
          )}
        >
          {ownerLabels[owner]}
        </span>
        <span
          className={cn(
            'rounded-sm border px-1.5 py-0.5 text-xs',
            priorityStyles[priority],
          )}
        >
          {priorityLabels[priority]}
        </span>
      </span>
    </li>
  );
};
