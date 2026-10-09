import '@fontsource/press-start-2p';
import { useState } from 'react';

import { MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router';

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
import type { Game } from '@/data/games';
import type { PokedexEntry } from '@/data/pokedex/types';
import { usePokemonSprite } from '@/hooks/usePokemonSprite';
import { cn } from '@/lib/utils';

import { BattleDialogList } from './trainer-dialog/BattleDialogList';
import { ChoicePicker } from './trainer-dialog/ChoicePicker';
import { GiftBadge } from './trainer-dialog/GiftBadge';
import { GamePokemon, TallGrassPokemon } from './trainer-dialog/TrainerPokemon';
import type { ListedBattle } from './trainerList';
import { TrainerSprite } from './TrainerSprite';

type TrainerDialogProps = {
  listed: ListedBattle | undefined;
  battles?: Array<ListedBattle>;
  place: string;
  game: Game;
  pokedex: Array<PokedexEntry>;
  href?: (path: string) => string;
  onSelect?: (key: string) => void;
  onClose: () => void;
};

export const TrainerDialog = ({
  listed,
  battles = [],
  place,
  game,
  pokedex,
  href,
  onSelect,
  onClose,
}: TrainerDialogProps) => {
  const navigate = useNavigate();
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
  const presence = listed?.battle.presence;
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
                  <DialogTitle>
                    {href && listed.battle.x !== undefined ? (
                      <button
                        type="button"
                        title="Show on map"
                        onClick={() => {
                          const floor = listed.battle.floor
                            ? `?floor=${listed.battle.floor}`
                            : '';

                          navigate(`${href(listed.battle.path)}${floor}`, {
                            state: { focusKey: listed.key },
                          });
                          onClose();
                        }}
                        className="cursor-pointer text-left underline-offset-4 hover:underline"
                      >
                        {listed.label}
                      </button>
                    ) : (
                      listed.label
                    )}
                  </DialogTitle>
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
            {presence && (
              <p
                className={cn(
                  'text-muted-foreground',
                  gameTheme
                    ? 'mx-2 border-t-2 border-dashed border-(--gb-ink) pt-3 text-[8px] leading-[12px]'
                    : 'border-t border-border pt-3 text-sm italic',
                )}
              >
                {presence}
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
