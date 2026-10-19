import '@fontsource/press-start-2p';
import { Fragment, type ComponentProps } from 'react';

import { Swords } from 'lucide-react';

import { useThemeSkin } from '@/components/settings/themes';
import type { Game } from '@/data/games';
import type { PokedexEntry } from '@/data/pokedex/types';
import type { TrainerParty } from '@/data/trainers/types';
import { type PokemonSprite, usePokemonSprite } from '@/hooks/usePokemonSprite';
import { cn } from '@/lib/utils';

import { GameTrainerAvatar } from './GameTrainerAvatar';
import type { ListedBattle } from './trainerList';
import { TrainerPartyTiles } from './TrainerPartyTiles';
import { ZaFrame } from './ZaFrame';

type TrainerTooltipProps = {
  listed: ListedBattle;
  encounters?: number;
  game: Game;
  pokedex: Array<PokedexEntry>;
};

const TrainerTooltipBody = ({
  listed: { battle, number },
  encounters = 1,
  game,
  pokedex,
}: TrainerTooltipProps) => {
  const gameTheme = useThemeSkin('trainers') === 'rby';
  const spriteFor = usePokemonSprite(game);

  const byChoice = battle.choicePrompt !== undefined;
  const parties = byChoice
    ? battle.parties.toSorted((a, b) => (a.choice ?? 0) - (b.choice ?? 0))
    : battle.parties;

  const names = new Map(
    pokedex
      .filter((entry) => !entry.form)
      .map((entry) => [entry.number, entry.name]),
  );
  const nameOf = (entry: number) => names.get(entry) ?? `#${entry}`;

  if (encounters > 1) {
    const note = `${encounters} encounters here · click to see all`;

    return gameTheme ? (
      <div className="pokedex-game gb-frame flex w-max items-center gap-3 px-4 py-3.5 text-left">
        <GameTrainerAvatar sprite={battle.sprite} />
        <div className="flex flex-col gap-2">
          <span className="text-[10px] leading-[14px] whitespace-nowrap">
            {battle.name}
          </span>
          <span className="text-[8px] leading-[12px] whitespace-nowrap text-muted-foreground">
            {note}
          </span>
        </div>
      </div>
    ) : (
      <div className="flex w-max items-center gap-2.5 rounded-sm bg-popover py-2 pr-3 pl-2.5 text-left text-popover-foreground shadow-lg ring-1 ring-foreground/10">
        <TrainerTile sprite={battle.sprite} />
        <div className="flex flex-col gap-0.5">
          <span className="text-base leading-snug font-medium whitespace-nowrap">
            {battle.name}
          </span>
          <span className="text-sm whitespace-nowrap text-muted-foreground">
            {note}
          </span>
        </div>
      </div>
    );
  }

  if (gameTheme) {
    return (
      <div
        className={cn(
          'pokedex-game gb-frame flex w-max flex-col gap-3 px-4 py-3.5 text-left',
          !byChoice && 'max-w-80',
        )}
      >
        <div className="flex items-center gap-3">
          <GameTrainerAvatar sprite={battle.sprite} />
          <span className="text-[10px] leading-[14px] whitespace-nowrap">
            {battle.name}
            {number && ` #${number}`}
          </span>
        </div>
        <hr className="border-t-2 border-foreground" />
        <div className={cn('flex gap-3', !byChoice && 'flex-col')}>
          {parties.map((party, index) => (
            <Fragment key={party.label ?? ''}>
              {byChoice && index > 0 && (
                <span
                  aria-hidden
                  className="w-0.5 self-stretch bg-foreground"
                />
              )}
              <GameParty party={party} spriteFor={spriteFor} />
            </Fragment>
          ))}
        </div>
        {battle.presence && (
          <span className="border-t-2 border-dashed border-(--gb-ink) pt-2 text-[8px] leading-[12px] text-muted-foreground">
            {battle.presence}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex w-max flex-col gap-2.5 rounded-sm bg-popover py-3 pr-3 pl-2.5 text-left text-popover-foreground shadow-lg ring-1 ring-foreground/10',
        !byChoice && 'max-w-80',
      )}
    >
      <div className="flex items-center gap-2.5">
        <TrainerTile sprite={battle.sprite} />
        <span className="text-base leading-snug font-medium whitespace-nowrap">
          {battle.name}
          {number && (
            <span className="font-normal text-muted-foreground/80">
              {' '}
              #{number}
            </span>
          )}
        </span>
      </div>
      <div className={cn('flex gap-2', byChoice ? 'gap-3' : 'flex-col')}>
        {parties.map((party, index) => (
          <Fragment key={party.label ?? ''}>
            {byChoice && index > 0 && (
              <span aria-hidden className="w-px self-stretch bg-border" />
            )}
            <TrainerPartyTiles
              party={party}
              spriteFor={spriteFor}
              nameOf={nameOf}
              linked={false}
              columns
            />
          </Fragment>
        ))}
      </div>
      {battle.presence && (
        <span className="border-t pt-2 text-sm text-muted-foreground italic">
          {battle.presence}
        </span>
      )}
    </div>
  );
};

const TrainerTile = ({ sprite }: { sprite?: string }) => (
  <span
    aria-hidden
    className="grid size-9 flex-none place-items-center rounded-sm"
    style={{
      background: 'color-mix(in oklch, var(--map-trainer) 22%, transparent)',
      color: 'var(--map-trainer)',
    }}
  >
    {sprite ? (
      <img
        src={sprite}
        alt=""
        className="size-8 object-cover object-top pixelated"
      />
    ) : (
      <Swords className="size-5" />
    )}
  </span>
);

const GameParty = ({
  party,
  spriteFor,
}: {
  party: TrainerParty;
  spriteFor: (number: number) => PokemonSprite;
}) => (
  <div className="flex flex-col gap-2">
    {party.label && (
      <span className="text-[8px] leading-[12px]">{party.label}</span>
    )}
    <ul
      aria-label={party.label ?? 'Party'}
      className="grid w-max grid-cols-2 gap-1.5"
    >
      {party.pokemon.map((pokemon, index) => (
        <li
          key={index}
          className="flex w-14 flex-col items-center gap-1 border-2 border-(--gb-ink) px-1 pt-0.5 pb-1"
        >
          <img
            src={spriteFor(pokemon.number).src}
            alt=""
            width={96}
            height={96}
            loading="lazy"
            className="size-8 flex-none object-contain"
          />
          <span className="text-[8px] leading-none">:L{pokemon.level}</span>
        </li>
      ))}
    </ul>
  </div>
);

export const TrainerTooltip = (
  props: ComponentProps<typeof TrainerTooltipBody>,
) => (
  <ZaFrame active={useThemeSkin('trainers') === 'za'}>
    <TrainerTooltipBody {...props} />
  </ZaFrame>
);
