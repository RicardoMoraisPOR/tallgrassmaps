import { useState } from 'react';

import { SelectField } from '@/components/SelectField';
import { ToggleChip } from '@/components/ToggleChip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

const variants = [
  'default',
  'outline',
  'secondary',
  'ghost',
  'destructive',
  'link',
] as const;

const sizes = ['xs', 'sm', 'default', 'lg'] as const;

export const ComponentSamples = () => {
  const [chip, setChip] = useState(true);
  const [on, setOn] = useState(true);
  const [choice, setChoice] = useState('one');

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-background p-4 text-foreground">
      {sizes.map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-2">
          {variants.map((variant) => (
            <Button key={variant} variant={variant} size={size}>
              {variant}
            </Button>
          ))}
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <Input placeholder="Input" className="max-w-48" />
        <Input placeholder="Disabled" disabled className="max-w-48" />
        <Switch checked={on} onCheckedChange={setOn} />
        <Switch
          size="sm"
          checked={!on}
          onCheckedChange={(next) => setOn(!next)}
        />
        <ToggleChip pressed={chip} onClick={() => setChip(!chip)}>
          Toggle chip
        </ToggleChip>
        <SelectField
          label="Select"
          value={choice}
          onChange={setChoice}
          options={[
            { value: 'one', label: 'One' },
            { value: 'two', label: 'Two' },
          ]}
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-3 text-card-foreground">
          Card
          <p className="text-sm text-muted-foreground">Muted text</p>
        </div>
        <div className="rounded-lg bg-muted p-3">Muted surface</div>
        <div className="rounded-lg border border-ring p-3">Ring border</div>
      </div>
    </div>
  );
};
