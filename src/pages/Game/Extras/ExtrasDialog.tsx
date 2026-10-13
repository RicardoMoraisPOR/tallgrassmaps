import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Game } from '@/data/games';
import type { Region } from '@/data/maps';

import type { GameExtra } from './types';

type ExtrasDialogProps = {
  game: Game;
  region: Region;
  extra: GameExtra | undefined;
  onOpenChange: (open: boolean) => void;
};

export const ExtrasDialog = ({
  game,
  region,
  extra,
  onOpenChange,
}: ExtrasDialogProps) => (
  <Dialog open={Boolean(extra)} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {game.shortName} {extra?.title.toLowerCase()}
        </DialogTitle>
      </DialogHeader>
      {extra && <extra.Content game={game} region={region} />}
    </DialogContent>
  </Dialog>
);
