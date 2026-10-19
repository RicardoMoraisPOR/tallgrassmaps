import '@fontsource/press-start-2p';
import type { ComponentProps } from 'react';

import { useThemeSkin } from '@/components/settings/themes';
import { itemDetails } from '@/data/items/details';

import { PokemonTypeTags } from '../Pokedex/PokemonTypeTags';
import { ZaFrame } from './ZaFrame';

const BALL_SPRITE = '/sprites/rby/overworld/poke_ball.png';

type ItemPopupProps = {
  name: string;
  hidden?: boolean;
  requires?: Array<string>;
  note?: string;
  sprite?: string;
};

const ItemPopupBody = ({
  name,
  hidden = false,
  requires = [],
  note,
  sprite = BALL_SPRITE,
}: ItemPopupProps) => {
  const gameTheme = useThemeSkin('dialogBoxes') === 'rby';
  const { effect, moveType } = itemDetails(name);
  const needs = requires.length > 0 && `Needs ${requires.join(' and ')}`;
  const accent = hidden ? '--map-hidden-item' : '--map-item';

  return gameTheme ? (
    <div className="pokedex-game gb-frame flex w-max max-w-64 flex-col gap-2 px-3.5 py-2.5">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden
          className="size-4 flex-none [image-rendering:pixelated]"
          style={{
            backgroundImage: `url(${BALL_SPRITE})`,
            backgroundSize: '100% 300%',
          }}
        />
        <span className="flex-1 text-[10px] leading-[14px]">{name}</span>
        {hidden && (
          <span className="bg-(--gb-ink) px-1 py-0.5 text-[8px] leading-none text-(--gb-screen)">
            Hidden
          </span>
        )}
      </div>
      {effect && <p className="text-[8px] leading-[12px]">{effect}</p>}
      {moveType && <PokemonTypeTags types={[moveType]} large />}
      {(needs || note) && (
        <div className="flex flex-col gap-1.5 border-t-2 border-dashed border-(--gb-ink) pt-2 text-[8px] leading-[12px]">
          {needs && <p>{needs}</p>}
          {note && <p>{note}</p>}
        </div>
      )}
    </div>
  ) : (
    <div className="flex w-max max-w-80 items-start gap-2.5 rounded-sm bg-popover py-2 pr-3.5 pl-2.5 text-popover-foreground shadow-lg ring-1 ring-foreground/10">
      <span
        aria-hidden
        className="mt-0.5 grid size-9 flex-none place-items-center rounded-sm"
        style={{
          background: `color-mix(in oklch, var(${accent}) 22%, transparent)`,
          color: `var(${accent})`,
        }}
      >
        <img
          src={sprite}
          alt=""
          className="size-8 object-cover object-top pixelated"
        />
      </span>
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-base leading-snug font-medium">{name}</span>
          {hidden && (
            <span className="rounded-sm bg-muted px-1.5 py-0.5 text-xs leading-none font-medium tracking-wide text-muted-foreground uppercase">
              Hidden
            </span>
          )}
        </div>
        {effect && (
          <p className="text-sm leading-snug text-muted-foreground">{effect}</p>
        )}
        {moveType && <PokemonTypeTags types={[moveType]} large />}
        {(needs || note) && (
          <div className="flex flex-col gap-1 border-t pt-2">
            {needs && (
              <span className="w-fit rounded-sm bg-muted px-1.5 py-0.5 text-[13px] leading-none font-medium">
                {needs}
              </span>
            )}
            {note && (
              <p className="text-sm text-muted-foreground italic">{note}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const ItemPopup = (props: ComponentProps<typeof ItemPopupBody>) => (
  <ZaFrame active={useThemeSkin('dialogBoxes') === 'za'}>
    <ItemPopupBody {...props} />
  </ZaFrame>
);
