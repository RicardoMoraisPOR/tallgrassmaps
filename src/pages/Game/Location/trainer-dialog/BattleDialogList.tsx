import type { BattleDialog } from '@/data/trainers/types';
import { cn } from '@/lib/utils';

import { GiftBox } from '../GiftBox';

export const BattleDialogList = ({
  dialog,
  gameTheme,
}: {
  dialog: Array<BattleDialog>;
  gameTheme: boolean;
}) => (
  <dl
    className={cn(
      'grid gap-3',
      gameTheme ? 'gb-frame gap-4 px-4 py-3' : 'rounded-[12px] border p-3',
    )}
  >
    {dialog.map(({ label, text, gift }) => (
      <div key={label} className="flex flex-col gap-1">
        <dt
          className={cn(
            'text-muted-foreground',
            gameTheme
              ? 'text-[8px] leading-[12px]'
              : 'text-xs font-medium tracking-wider uppercase',
          )}
        >
          {label}
        </dt>
        <dd
          className={cn(
            'whitespace-pre-line',
            gameTheme ? 'text-[8px] leading-[14px]' : 'text-sm',
          )}
        >
          {text}
        </dd>
        {gift && (
          <dd className="pt-1">
            <GiftBox gift={gift} gameTheme={gameTheme} />
          </dd>
        )}
      </div>
    ))}
  </dl>
);
