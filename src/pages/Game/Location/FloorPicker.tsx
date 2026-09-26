import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { LocationFloor } from '@/data/maps';

type FloorPickerProps = {
  floors: Array<LocationFloor>;
  selected: string;
  onSelect: (id: string) => void;
};

export const FloorPicker = ({
  floors,
  selected,
  onSelect,
}: FloorPickerProps) => {
  return (
    <ToggleGroup
      type="single"
      size="sm"
      spacing={1}
      aria-label="Floor"
      value={selected}
      onValueChange={(id) => {
        if (id) onSelect(id);
      }}
      className="pointer-events-auto flex-wrap justify-end rounded-xl border bg-card/90 p-1 shadow-sm backdrop-blur"
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
  );
};
