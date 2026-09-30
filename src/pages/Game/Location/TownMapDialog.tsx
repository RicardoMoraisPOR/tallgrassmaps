import '@fontsource/press-start-2p';
import { RegionMap } from '@/components/map/RegionMap';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Region } from '@/data/maps';

type TownMapDialogProps = {
  open: boolean;
  region: Region;
  path: string;
  href: (path: string) => string;
  onClose: () => void;
};

export const TownMapDialog = ({
  open,
  region,
  path,
  href,
  onClose,
}: TownMapDialogProps) => (
  <Dialog
    open={open}
    onOpenChange={(isOpen) => {
      if (!isOpen) onClose();
    }}
  >
    <DialogContent className="pokedex-game gb-frame flex flex-col gap-4 rounded-none p-6 ring-0 sm:max-w-md">
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
        <RegionMap region={region} locationHref={href} focus={path} gameStyle />
      </div>
    </DialogContent>
  </Dialog>
);
