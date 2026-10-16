import '@fontsource/press-start-2p';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Game } from '@/data/games';
import type { Region } from '@/data/maps';

import { TownMapView } from './TownMapView';

type TownMapDialogProps = {
  open: boolean;
  game: Game;
  region: Region;
  path: string;
  initial?: string;
  onClose: () => void;
};

export const TownMapDialog = ({
  open,
  game,
  region,
  path,
  initial,
  onClose,
}: TownMapDialogProps) => (
  <Dialog
    open={open}
    onOpenChange={(isOpen) => {
      if (!isOpen) onClose();
    }}
  >
    <DialogContent className="pokedex-game gb-frame flex flex-col gap-4 rounded-none p-6 ring-0 sm:max-w-2xl">
      <DialogTitle className="text-[10px] leading-[14px] font-normal">
        Town Map
      </DialogTitle>
      <DialogDescription className="sr-only">
        {region.name} Town Map
      </DialogDescription>
      <div
        onClickCapture={(event) => {
          if ((event.target as Element).closest('a')) onClose();
        }}
      >
        <TownMapView
          game={game}
          region={region}
          path={path}
          initial={initial}
        />
      </div>
    </DialogContent>
  </Dialog>
);
