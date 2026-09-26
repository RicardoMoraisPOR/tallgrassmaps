import { type ReactNode, useId } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { type ThemeStyle, useSettingsStore } from '@/stores/settings';

import {
  isThemeAvailable,
  resolveTheme,
  themeAreas,
  themeStyles,
} from './themes';

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const settings = useSettingsStore();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85svh] flex-col gap-6 overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Saved in this browser.</DialogDescription>
        </DialogHeader>

        <Section title="Motion">
          <SwitchRow
            label="Animations"
            description="Plays animations and transitions across the site."
            checked={settings.animations}
            onCheckedChange={settings.setAnimations}
          />
        </Section>

        <Section title="Mouse pointer">
          <SwitchRow
            label="Game pointers"
            description="Uses sprites from the game as the mouse pointer in some places."
            checked={settings.gamePointer}
            onCheckedChange={settings.setGamePointer}
          />
        </Section>

        <Section title="Themes">
          <SwitchRow
            label="Use game themes"
            description="Uses each game's own look wherever one is available."
            checked={settings.useGameThemes}
            onCheckedChange={settings.setUseGameThemes}
          />
          <div className="flex flex-col gap-3">
            {themeAreas.map(({ area, label }) => (
              <div
                key={area}
                className="flex items-center justify-between gap-4"
              >
                <span className="text-sm">{label}</span>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  size="sm"
                  aria-label={`${label} theme`}
                  value={resolveTheme(area, settings)}
                  disabled={settings.useGameThemes}
                  onValueChange={(style) => {
                    if (style) settings.setTheme(area, style as ThemeStyle);
                  }}
                >
                  {themeStyles.map(({ style, label: styleLabel }) => {
                    const available = isThemeAvailable(area, style);

                    return (
                      <ToggleGroupItem
                        key={style}
                        value={style}
                        disabled={!available}
                        className="px-3 text-xs data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background"
                      >
                        {styleLabel}
                        {!available && (
                          <span className="text-[10px] opacity-70">Soon</span>
                        )}
                      </ToggleGroupItem>
                    );
                  })}
                </ToggleGroup>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            The game-style Pokédex and sprites, and a Tall Grass Town Map, are
            on the way. Until then each option uses the style that exists.
          </p>
        </Section>
      </DialogContent>
    </Dialog>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
};

type SwitchRowProps = {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

const SwitchRow = ({
  label,
  description,
  checked,
  onCheckedChange,
}: SwitchRowProps) => {
  const id = useId();

  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={id} className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
};
