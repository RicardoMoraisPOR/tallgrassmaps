import { useId } from 'react';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { type PokemonSprite } from '@/hooks/usePokemonSprite';
import { cn } from '@/lib/utils';

type ChoiceOption = {
  value: string;
  label: string;
  sprite?: PokemonSprite;
};

export const ChoicePicker = ({
  prompt,
  options,
  selected,
  gameTheme,
  divided = false,
  onSelect,
}: {
  prompt: string;
  options: Array<ChoiceOption>;
  selected: string;
  gameTheme: boolean;
  divided?: boolean;
  onSelect: (value: string) => void;
}) => {
  const labelId = useId();

  return (
    <div className="flex flex-col gap-2">
      <h3
        id={labelId}
        className="text-xs font-medium tracking-wider text-muted-foreground uppercase pokedex-game:text-[10px] pokedex-game:font-normal pokedex-game:text-foreground"
      >
        {prompt}:
      </h3>
      <ToggleGroup
        type="single"
        variant={gameTheme ? 'default' : 'outline'}
        spacing={gameTheme ? 3 : 1}
        aria-labelledby={labelId}
        value={selected}
        onValueChange={(value) => {
          if (value) onSelect(value);
        }}
        className={cn('flex-wrap', gameTheme && 'px-2')}
      >
        {options.map(({ value, label, sprite }) => (
          <ToggleGroupItem
            key={value}
            value={value}
            className={cn(
              'h-auto gap-1.5 py-1 pr-3',
              sprite ? 'pl-1' : 'min-h-9 pl-3',
              gameTheme
                ? 'rounded-none border-2 border-(--gb-ink) text-[8px] font-normal text-(--gb-ink) hover:bg-(--gb-ink) hover:text-(--gb-screen) data-[state=on]:bg-(--gb-ink) data-[state=on]:text-(--gb-screen)'
                : 'data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background',
            )}
          >
            {sprite && (
              <img
                src={sprite.src}
                alt=""
                width={96}
                height={96}
                className={cn(
                  'size-7 object-contain',
                  (gameTheme || sprite.pixelated) && 'pixelated',
                )}
              />
            )}
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {divided && (
        <hr
          className={cn(
            'mt-2',
            gameTheme ? 'mx-2 border-t-2 border-(--gb-ink)' : 'border-border',
          )}
        />
      )}
    </div>
  );
};
