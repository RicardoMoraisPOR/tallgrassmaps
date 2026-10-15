import { useMemo } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

import { imageGroupsFor } from './imageGroups';

type ImageListDialogProps = {
  name: string;
  by?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ImageListDialog = ({
  name,
  by,
  open,
  onOpenChange,
}: ImageListDialogProps) => {
  const groups = useMemo(() => imageGroupsFor(name), [name]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85svh] flex-col gap-6 overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>
            {by ? `Provided by ${by}.` : 'Provided by this source.'}
          </DialogDescription>
        </DialogHeader>
        {groups.map((group) => (
          <section key={group.title} className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">
              {group.title}{' '}
              <span className="font-normal text-muted-foreground tabular-nums">
                · {group.sprites.length}
              </span>
            </h3>
            <ul
              className={cn(
                'grid gap-2',
                group.large
                  ? 'grid-cols-[repeat(auto-fill,minmax(7rem,1fr))]'
                  : 'grid-cols-[repeat(auto-fill,minmax(3.5rem,1fr))]',
              )}
            >
              {group.sprites.map((sprite) => (
                <li
                  key={sprite.src}
                  title={sprite.label}
                  className={cn(
                    'flex items-center justify-center rounded-sm border bg-muted/40 p-1',
                    group.large ? 'aspect-4/5 p-2' : 'aspect-square',
                  )}
                >
                  <img
                    src={sprite.src}
                    alt={sprite.label}
                    width={96}
                    height={96}
                    loading="lazy"
                    decoding="async"
                    className={cn(
                      'size-full object-contain',
                      sprite.pixelated && 'pixelated',
                    )}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default ImageListDialog;
