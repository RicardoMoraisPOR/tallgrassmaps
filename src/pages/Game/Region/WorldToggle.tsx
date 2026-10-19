import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

type WorldSwitchProps = {
  world: boolean;
  onChange: (world: boolean) => void;
  labels?: [other: string, world: string];
  worldFirst?: boolean;
};

export const WorldSwitch = ({
  world,
  onChange,
  labels = ['Town Map', 'World'],
  worldFirst = false,
}: WorldSwitchProps) => {
  const items = [
    { value: 'other', label: labels[0] },
    { value: 'world', label: labels[1] },
  ];

  return (
    <ToggleGroup
      type="single"
      size="sm"
      spacing={1}
      aria-label="Map view"
      value={world ? 'world' : 'other'}
      onValueChange={(value) => {
        if (value) onChange(value === 'world');
      }}
      className="pointer-events-auto rounded-sm border bg-card/90 p-1 shadow-sm"
    >
      {(worldFirst ? items.toReversed() : items).map(({ value, label }) => (
        <ToggleGroupItem
          key={value}
          value={value}
          className="data-[state=on]:bg-foreground data-[state=on]:text-background"
        >
          {label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};

export const WorldToggle = (props: WorldSwitchProps) => {
  return (
    <div className="pointer-events-none absolute inset-x-14 bottom-4 z-10 flex justify-center">
      <WorldSwitch {...props} />
    </div>
  );
};
