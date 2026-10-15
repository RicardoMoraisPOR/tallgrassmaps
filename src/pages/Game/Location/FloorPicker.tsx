import { Layers } from 'lucide-react';

import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { LocationFloor } from '@/data/maps';

type FloorPickerProps = {
  floors: Array<LocationFloor>;
  selected: string;
  onSelect: (id: string) => void;
  stacked: boolean;
  onStackedChange: (stacked: boolean) => void;
};

export const FloorPicker = ({
  floors,
  selected,
  onSelect,
  stacked,
  onStackedChange,
}: FloorPickerProps) => {
  return (
    <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-1 rounded-lg border bg-card/90 p-1 shadow-sm">
      {floors.length > 1 && (
        <Toggle
          size="sm"
          pressed={stacked}
          onPressedChange={onStackedChange}
          aria-label="Show all floors"
          className="gap-1.5 data-[state=on]:bg-foreground data-[state=on]:text-background"
        >
          <Layers aria-hidden />
          All floors
        </Toggle>
      )}
      <ToggleGroup
        type="single"
        size="sm"
        spacing={1}
        aria-label="Floor"
        value={selected}
        onValueChange={(id) => {
          if (id) onSelect(id);
        }}
        className="flex-wrap justify-end"
      >
        {floors.map((floor) => (
          <ToggleGroupItem
            key={floor.id}
            value={floor.id}
            className="tabular-nums data-[state=on]:bg-foreground data-[state=on]:text-background"
          >
            {floor.name}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};
