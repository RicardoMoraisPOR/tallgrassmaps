import '@fontsource/press-start-2p';
import { Fragment } from 'react';

import { useThemeStyle } from '@/components/settings/themes';
import type { Game } from '@/data/games';
import type { PokedexEntry } from '@/data/pokedex/types';
import type { TrainerParty } from '@/data/trainers/types';
import { type PokemonSprite, usePokemonSprite } from '@/hooks/usePokemonSprite';
import { cn } from '@/lib/utils';

import type { ListedBattle } from './trainerList';
import { TrainerPartyTiles } from './TrainerPartyTiles';

type TrainerTooltipProps = {
  listed: ListedBattle;
  encounters?: number;
  game: Game;
  pokedex: Array<PokedexEntry>;
};

export const TrainerTooltip = ({
  listed: { battle, number },
  encounters = 1,
  game,
  pokedex,
}: TrainerTooltipProps) => {
  const gameTheme = useThemeStyle('trainers') === 'game';
  const spriteFor = usePokemonSprite(game);

  const byChoice = battle.choicePrompt !== undefined;
  const parties = byChoice
    ? battle.parties.toSorted((a, b) => (a.choice ?? 0) - (b.choice ?? 0))
    : battle.parties;

  const names = new Map(pokedex.map((entry) => [entry.number, entry.name]));
  const nameOf = (entry: number) => names.get(entry) ?? `#${entry}`;

  if (encounters > 1) {
    const note = `${encounters} encounters here · click to see all`;

    return gameTheme ? (
      <div className="pokedex-game gb-frame flex w-max flex-col gap-2 px-4 py-3.5 text-left">
        <span className="text-[10px] leading-[14px] whitespace-nowrap">
          {battle.name}
        </span>
        <span className="text-[8px] leading-[12px] whitespace-nowrap text-muted-foreground">
          {note}
        </span>
      </div>
    ) : (
      <div className="flex w-max flex-col gap-0.5 rounded-xl bg-popover px-3 py-2 text-left text-popover-foreground shadow-lg ring-1 ring-foreground/10">
        <span className="text-sm font-medium whitespace-nowrap">
          {battle.name}
        </span>
        <span className="text-xs whitespace-nowrap text-muted-foreground">
          {note}
        </span>
      </div>
    );
  }

  if (gameTheme) {
    return (
      <div
        className={cn(
          'pokedex-game gb-frame flex w-max flex-col gap-3 px-4 py-3.5 text-left',
          !byChoice && 'max-w-64',
        )}
      >
        <span className="text-[10px] leading-[14px] whitespace-nowrap">
          {battle.name}
          {number && ` #${number}`}
        </span>
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
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex w-max flex-col gap-2 rounded-xl bg-popover p-3 text-left text-popover-foreground shadow-lg ring-1 ring-foreground/10',
        !byChoice && 'max-w-64',
      )}
    >
      <span className="text-sm font-medium whitespace-nowrap">
        {battle.name}
        {number && (
          <span className="font-normal text-muted-foreground/80">
            {' '}
            #{number}
          </span>
        )}
      </span>
      <hr className="border-border" />
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
    </div>
  );
};

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
      className="grid w-max grid-cols-2 gap-x-4 gap-y-1"
    >
      {party.pokemon.map((pokemon, index) => (
        <li key={index} className="flex items-center gap-1">
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
