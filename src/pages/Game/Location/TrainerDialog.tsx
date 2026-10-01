import '@fontsource/press-start-2p';
import { useId, useState } from 'react';

import { MessageSquare, Trophy } from 'lucide-react';

import { Collapse } from '@/components/Collapse';
import { useThemeStyle } from '@/components/settings/themes';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { Game } from '@/data/games';
import type { NpcGift } from '@/data/npcs/types';
import type { PokedexEntry } from '@/data/pokedex/types';
import type { BattleDialog, TrainerPokemon } from '@/data/trainers/types';
import { type PokemonSprite, usePokemonSprite } from '@/hooks/usePokemonSprite';
import { cn } from '@/lib/utils';

import { PokemonTypeTags } from '../Pokedex/PokemonTypeTags';
import { GiftBox } from './GiftBox';
import { PokedexEntryLink } from './PokedexEntryLink';
import type { ListedBattle } from './trainerList';
import { TrainerSprite } from './TrainerSprite';

const NUM_MOVES = 4;

type TrainerDialogProps = {
  listed: ListedBattle | undefined;
  battles?: Array<ListedBattle>;
  place: string;
  game: Game;
  pokedex: Array<PokedexEntry>;
  onSelect?: (key: string) => void;
  onClose: () => void;
};

type PokemonProps = {
  pokemon: TrainerPokemon;
  name: string;
  types: Array<string>;
  sprite: PokemonSprite;
  onOpenPokedex: () => void;
};

export const TrainerDialog = ({
  listed,
  battles = [],
  place,
  game,
  pokedex,
  onSelect,
  onClose,
}: TrainerDialogProps) => {
  const spriteFor = usePokemonSprite(game);
  const gameTheme = useThemeStyle('trainers') === 'game';
  const [showingDialog, setShowingDialog] = useState(false);
  const [picked, setPicked] = useState<number>();

  if (!listed && showingDialog) setShowingDialog(false);
  if (!listed && picked !== undefined) setPicked(undefined);

  const pokedexByNumber = new Map(
    pokedex.map((entry) => [entry.number, entry]),
  );
  const nameOf = (number: number) =>
    pokedexByNumber.get(number)?.name ?? `#${number}`;
  const Pokemon = gameTheme ? GamePokemon : TallGrassPokemon;
  const area = listed?.battle.floor ? undefined : listed?.battle.area;
  const battleDialog = listed?.battle.dialog ?? [];
  const gifts = battleDialog.flatMap(({ gift }) => gift ?? []);
  const encounters =
    listed?.battle.x === undefined
      ? []
      : battles.filter(
          ({ battle }) =>
            battle.x === listed.battle.x && battle.y === listed.battle.y,
        );
  const parties = listed?.battle.parties ?? [];
  const choices = parties
    .flatMap((party) => party.choice ?? [])
    .sort((a, b) => a - b);
  const choice =
    picked !== undefined && choices.includes(picked) ? picked : choices[0];
  const shownParties =
    choices.length > 0
      ? parties.filter((party) => party.choice === choice)
      : parties;

  return (
    <Dialog
      open={listed !== undefined}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className={cn(
          'flex max-h-[85svh] flex-col p-0 sm:max-w-2xl',
          gameTheme && 'pokedex-game gb-frame rounded-none ring-0',
        )}
      >
        {listed && (
          <div
            className={cn(
              'flex min-h-0 flex-col gap-4 overflow-y-auto p-4',
              gameTheme && 'p-6',
            )}
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                {listed.battle.sprite && (
                  <TrainerSprite src={listed.battle.sprite} />
                )}
                <DialogHeader className="min-w-0 flex-1">
                  <DialogTitle>{listed.label}</DialogTitle>
                  <DialogDescription className={cn(!area && 'sr-only')}>
                    {area ?? place}
                  </DialogDescription>
                </DialogHeader>
                {battleDialog.length > 0 && (
                  <div className="mr-8 flex items-center gap-2">
                    {gameTheme ? (
                      <button
                        type="button"
                        aria-pressed={showingDialog}
                        onClick={() => setShowingDialog((showing) => !showing)}
                        className="cursor-pointer border-2 border-(--gb-ink) px-2 py-1.5 text-[8px] leading-none transition-colors hover:bg-(--gb-ink) hover:text-(--gb-screen) aria-pressed:bg-(--gb-ink) aria-pressed:text-(--gb-screen)"
                      >
                        DIALOG
                      </button>
                    ) : (
                      <Button
                        variant="outline"
                        size="xs"
                        aria-pressed={showingDialog}
                        onClick={() => setShowingDialog((showing) => !showing)}
                        className="aria-pressed:bg-muted"
                      >
                        <MessageSquare />
                        Dialog
                      </Button>
                    )}
                  </div>
                )}
              </div>
              {encounters.length > 1 && onSelect && (
                <div className="pt-4">
                  <ChoicePicker
                    prompt="Encounter"
                    options={encounters.map((encounter) => ({
                      value: encounter.key,
                      label: encounter.label,
                    }))}
                    selected={listed.key}
                    gameTheme={gameTheme}
                    onSelect={onSelect}
                  />
                </div>
              )}
              <Collapse
                open={showingDialog}
                className={cn('pt-4', gameTheme && 'px-2 pb-2')}
              >
                <BattleDialogList dialog={battleDialog} gameTheme={gameTheme} />
              </Collapse>
            </div>
            {choice !== undefined && (
              <ChoicePicker
                prompt={listed.battle.choicePrompt ?? ''}
                options={choices.map((number) => ({
                  value: String(number),
                  label: nameOf(number),
                  sprite: spriteFor(number),
                }))}
                selected={String(choice)}
                gameTheme={gameTheme}
                divided
                onSelect={(value) => setPicked(Number(value))}
              />
            )}
            {shownParties.map((party) => (
              <section
                key={party.label ?? ''}
                aria-label={party.label ?? 'Party'}
                className="flex flex-col gap-2"
              >
                {party.label && choice === undefined && (
                  <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase pokedex-game:text-[10px] pokedex-game:font-normal pokedex-game:text-foreground">
                    {party.label}
                  </h3>
                )}
                <ul
                  className={cn(
                    'grid gap-2 sm:grid-cols-2',
                    gameTheme && 'gap-4 p-2',
                  )}
                >
                  {party.pokemon.map((pokemon, index) => (
                    <Pokemon
                      key={index}
                      pokemon={pokemon}
                      name={nameOf(pokemon.number)}
                      types={pokedexByNumber.get(pokemon.number)?.types ?? []}
                      sprite={spriteFor(pokemon.number)}
                      onOpenPokedex={onClose}
                    />
                  ))}
                </ul>
              </section>
            ))}
            {gifts.length > 0 && (
              <section
                aria-label="Gives you"
                className={cn(
                  'flex flex-wrap items-center gap-x-3 gap-y-1',
                  gameTheme && 'px-2',
                )}
              >
                <h3
                  className={cn(
                    'text-muted-foreground',
                    gameTheme
                      ? 'text-[8px] leading-none'
                      : 'text-xs font-medium tracking-wider uppercase',
                  )}
                >
                  Gives you
                </h3>
                {gifts.map((gift) => (
                  <GiftBadge
                    key={gift.name}
                    gift={gift}
                    gameTheme={gameTheme}
                  />
                ))}
              </section>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

type ChoiceOption = {
  value: string;
  label: string;
  sprite?: PokemonSprite;
};

const ChoicePicker = ({
  prompt,
  options,
  selected,
  gameTheme,
  divided = false,
  onSelect,
}: {
  prompt: string;
  options: Array<ChoiceOption>;
  selected: string;
  gameTheme: boolean;
  divided?: boolean;
  onSelect: (value: string) => void;
}) => {
  const labelId = useId();

  return (
    <div className="flex flex-col gap-2">
      <h3
        id={labelId}
        className="text-xs font-medium tracking-wider text-muted-foreground uppercase pokedex-game:text-[10px] pokedex-game:font-normal pokedex-game:text-foreground"
      >
        {prompt}:
      </h3>
      <ToggleGroup
        type="single"
        variant={gameTheme ? 'default' : 'outline'}
        spacing={gameTheme ? 3 : 1}
        aria-labelledby={labelId}
        value={selected}
        onValueChange={(value) => {
          if (value) onSelect(value);
        }}
        className={cn('flex-wrap', gameTheme && 'px-2')}
      >
        {options.map(({ value, label, sprite }) => (
          <ToggleGroupItem
            key={value}
            value={value}
            className={cn(
              'h-auto gap-1.5 py-1 pr-3',
              sprite ? 'pl-1' : 'min-h-9 pl-3',
              gameTheme
                ? 'rounded-none border-2 border-(--gb-ink) text-[8px] font-normal text-(--gb-ink) hover:bg-(--gb-ink) hover:text-(--gb-screen) data-[state=on]:bg-(--gb-ink) data-[state=on]:text-(--gb-screen)'
                : 'data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background',
            )}
          >
            {sprite && (
              <img
                src={sprite.src}
                alt=""
                width={96}
                height={96}
                className={cn(
                  'size-7 object-contain',
                  (gameTheme || sprite.pixelated) && 'pixelated',
                )}
              />
            )}
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {divided && (
        <hr
          className={cn(
            'mt-2',
            gameTheme ? 'mx-2 border-t-2 border-(--gb-ink)' : 'border-border',
          )}
        />
      )}
    </div>
  );
};

const GiftBadge = ({
  gift,
  gameTheme,
}: {
  gift: NpcGift;
  gameTheme: boolean;
}) => (
  <span
    title={`Gives you ${gift.name}`}
    aria-label={`Gives you ${gift.name}`}
    className={cn(
      'inline-flex shrink-0 items-center gap-1 whitespace-nowrap',
      gameTheme ? 'text-[8px] leading-none' : 'text-xs font-medium',
    )}
  >
    {!gameTheme && (
      <Trophy
        aria-hidden
        className="size-3.5 text-amber-600 dark:text-amber-400"
      />
    )}
    <img
      src={gift.sprite}
      alt=""
      className="size-4 object-cover object-top pixelated"
    />
    {gift.name}
  </span>
);

const BattleDialogList = ({
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

const TallGrassPokemon = ({
  pokemon,
  name,
  types,
  sprite,
  onOpenPokedex,
}: PokemonProps) => {
  return (
    <li className="flex flex-col gap-2 rounded-[12px] border p-2.5">
      <div className="flex items-center gap-2">
        <img
          src={sprite.src}
          alt=""
          width={96}
          height={96}
          loading="lazy"
          className={cn(
            'size-10 flex-none object-contain',
            sprite.pixelated && 'pixelated',
          )}
        />
        <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
          <PokedexEntryLink
            number={pokemon.number}
            onClick={onOpenPokedex}
            className="max-w-full truncate text-sm font-medium"
          >
            {name}
          </PokedexEntryLink>
          <PokemonTypeTags types={types} />
        </div>
        <span className="text-[13px] text-muted-foreground tabular-nums">
          Lv. {pokemon.level}
        </span>
      </div>
      <ul aria-label="Moves" className="grid grid-cols-2 gap-1">
        {pokemon.moves.map((move) => (
          <li
            key={move}
            className="truncate rounded-md bg-muted px-2 py-0.5 text-xs leading-5"
          >
            {move}
          </li>
        ))}
      </ul>
    </li>
  );
};

const GamePokemon = ({
  pokemon,
  name,
  types,
  sprite,
  onOpenPokedex,
}: PokemonProps) => {
  const emptySlots = NUM_MOVES - pokemon.moves.length;

  return (
    <li className="gb-frame flex flex-col gap-3 px-4 pt-2.5 pb-4">
      <div className="flex items-center gap-4">
        <img
          src={sprite.src}
          alt=""
          width={96}
          height={96}
          loading="lazy"
          className="size-10 flex-none object-contain"
        />
        <div className="gb-status flex min-w-0 flex-1 flex-col gap-1 pr-2 pb-2 text-[10px] leading-none">
          <div className="flex min-w-0 items-end justify-between gap-2">
            <PokedexEntryLink
              number={pokemon.number}
              onClick={onOpenPokedex}
              className="truncate leading-[14px]"
            >
              {name}
            </PokedexEntryLink>
            <span className="flex-none">:L{pokemon.level}</span>
          </div>
          <PokemonTypeTags types={types} />
        </div>
      </div>
      <ul
        aria-label="Moves"
        className="grid grid-cols-2 gap-x-3 gap-y-2.5 pl-1 text-[8px] leading-none"
      >
        {pokemon.moves.map((move) => (
          <li key={move} className="truncate">
            {move}
          </li>
        ))}
        {Array.from({ length: emptySlots }, (_, index) => (
          <li key={`empty-${index}`} aria-hidden>
            -
          </li>
        ))}
      </ul>
    </li>
  );
};
