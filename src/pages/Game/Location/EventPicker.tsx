import { useId } from 'react';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { MapEvent } from '@/data/maps';

import type { EventState } from './useEventState';

type EventPickerProps = {
  event: MapEvent;
  selected: EventState;
  onSelect: (state: EventState) => void;
};

const options: Array<{ value: EventState; label: string }> = [
  { value: 'before', label: 'Before' },
  { value: 'after', label: 'After' },
];

export const EventPicker = ({
  event,
  selected,
  onSelect,
}: EventPickerProps) => {
  const labelId = useId();

  return (
    <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-end gap-x-1 gap-y-0.5 rounded-xl border bg-card/90 p-1 shadow-sm backdrop-blur">
      <span
        id={labelId}
        className="min-w-0 px-2 text-[13px] font-medium text-foreground"
      >
        {event.name}
      </span>
      <ToggleGroup
        type="single"
        size="sm"
        spacing={1}
        aria-labelledby={labelId}
        value={selected}
        onValueChange={(value) => {
          if (value) onSelect(value as EventState);
        }}
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            className="data-[state=on]:bg-foreground data-[state=on]:text-background"
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};
