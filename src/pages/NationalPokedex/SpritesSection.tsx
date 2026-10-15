import { useId, useState } from 'react';

import { ChevronDown } from 'lucide-react';

import { Collapse } from '@/components/Collapse';

import type { SpriteOption } from './pokemonProfile';
import { SpriteGallery } from './SpriteGallery';

export const SpritesSection = ({
  name,
  sprites,
}: {
  name: string;
  sprites: Array<SpriteOption>;
}) => {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <section className="flex flex-col gap-2.5">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((current) => !current)}
          className="group flex w-full items-center justify-between gap-3 rounded-sm text-left text-xs font-medium tracking-wider text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <span>
            Sprites
            <span className="ml-2 font-normal tabular-nums">
              {sprites.length}
            </span>
          </span>
          <ChevronDown
            aria-hidden
            className="size-4 flex-none transition-transform group-aria-expanded:rotate-180 motion-reduce:transition-none"
          />
        </button>
      </h3>
      <Collapse open={open} id={panelId}>
        <SpriteGallery name={name} sprites={sprites} />
      </Collapse>
    </section>
  );
};
