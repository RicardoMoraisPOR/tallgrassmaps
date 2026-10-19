import '@fontsource/press-start-2p';
import { useState } from 'react';

import { Store } from 'lucide-react';

import { useThemeStyle } from '@/components/settings/themes';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Shop } from '@/data/shops/types';
import { cn } from '@/lib/utils';

type ShopDialogProps = {
  shop: { shops: Array<Shop>; selected: string } | undefined;
  onClose: () => void;
};

const tabLabel = ({ floor, name }: Shop) =>
  [floor?.toUpperCase(), name].filter(Boolean).join(' · ');

export const ShopDialog = ({ shop, onClose }: ShopDialogProps) => {
  const gameTheme = useThemeStyle('trainers') === 'game';
  const [picked, setPicked] = useState<string>();

  if (!shop && picked !== undefined) setPicked(undefined);

  const shops = shop?.shops ?? [];
  const current =
    shops.find(({ id }) => id === (picked ?? shop?.selected)) ?? shops[0];

  return (
    <Dialog
      open={shop !== undefined}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className={cn(
          'flex max-h-[85svh] flex-col gap-0 p-0 sm:max-w-md',
          gameTheme && 'pokedex-game gb-frame rounded-none ring-0',
        )}
      >
        {current && (
          <div
            className={cn(
              'flex min-h-0 flex-col gap-4 overflow-y-auto p-4',
              gameTheme && 'p-6',
            )}
          >
            <DialogHeader className="flex-row items-center gap-2.5">
              {!gameTheme && (
                <span
                  aria-hidden
                  className="grid size-7 flex-none place-items-center rounded-sm"
                  style={{
                    background:
                      'color-mix(in oklch, var(--map-service) 22%, transparent)',
                    color: 'var(--map-service)',
                  }}
                >
                  <Store className="size-4" />
                </span>
              )}
              <DialogTitle>{current.building}</DialogTitle>
              <DialogDescription className="sr-only">
                Items for sale
              </DialogDescription>
            </DialogHeader>
            {shops.length > 1 && (
              <div
                role="tablist"
                aria-label="Counters"
                className="flex flex-wrap gap-1"
              >
                {shops.map((entry) => {
                  const selected = entry.id === current.id;

                  return (
                    <button
                      key={entry.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setPicked(entry.id)}
                      className={cn(
                        'cursor-pointer rounded-sm border px-2.5 py-1.5 text-xs font-medium',
                        selected
                          ? 'border-border bg-muted text-foreground'
                          : 'border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                        gameTheme &&
                          'rounded-none border-2 border-(--gb-ink) text-[8px] leading-none aria-selected:bg-(--gb-ink) aria-selected:text-(--gb-screen)',
                      )}
                    >
                      {tabLabel(entry)}
                    </button>
                  );
                })}
              </div>
            )}
            <ul
              role="tabpanel"
              aria-label={tabLabel(current)}
              className={cn('flex flex-col', gameTheme && 'gap-3 p-2')}
            >
              {current.stock.map(({ name, price }) => (
                <li
                  key={name}
                  className={cn(
                    'flex items-baseline justify-between gap-4 py-2 text-sm',
                    !gameTheme && 'border-b border-border last:border-b-0',
                    gameTheme && 'py-0 text-[8px] leading-[12px]',
                  )}
                >
                  <span>{name}</span>
                  <span className="tabular-nums">
                    ¥{price.toLocaleString('en')}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
