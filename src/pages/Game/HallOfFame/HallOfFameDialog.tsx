import '@fontsource/press-start-2p';
import { type KeyboardEvent, type ReactNode, useState } from 'react';

import { Eye, Plus, Share2 } from 'lucide-react';

import { useThemeStyle } from '@/components/settings/themes';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { Game } from '@/data/games';
import type { PokedexEntry } from '@/data/pokedex/types';
import { usePokemonSprite } from '@/hooks/usePokemonSprite';
import { cn } from '@/lib/utils';

import { PokemonTypeTags } from '../Pokedex/PokemonTypeTags';
import {
  clampLevel,
  hasHallOfFame,
  MAX_LEVEL,
  type Member,
  MIN_LEVEL,
  renderTeamImage,
  type Team,
} from './hallOfFame';

const DEFAULT_LEVEL = 50;
const FEEDBACK_MS = 2000;
const TITLE = 'Hall of Fame maker';
const BLOCKED_LEVEL_KEYS = new Set(['-', '+', 'e', 'E', '.', ',']);

const gameButtonClass =
  'cursor-pointer border-2 border-(--gb-ink) px-3 py-2 text-[8px] leading-none transition-colors hover:bg-(--gb-ink) hover:text-(--gb-screen) disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-(--gb-ink)';

const gameInputClass =
  'h-auto rounded-none border-2 border-(--gb-ink) bg-transparent px-3 py-2 text-[8px] leading-none shadow-none focus-visible:ring-0';

type HallOfFameDialogProps = {
  open: boolean;
  game?: Game;
  pokedex?: Array<PokedexEntry>;
  team: Team;
  gamePicker?: ReactNode;
  onTeamChange: (team: Team) => void;
  onClose: () => void;
};

export const HallOfFameDialog = ({
  open,
  game,
  pokedex = [],
  team,
  gamePicker,
  onTeamChange,
  onClose,
}: HallOfFameDialogProps) => {
  const prefersGameTheme = useThemeStyle('hallOfFame') === 'game';
  const [editing, setEditing] = useState<number>();
  const [preview, setPreview] = useState<string>();

  const gameTheme =
    game !== undefined && hasHallOfFame(game) && prefersGameTheme;
  const entryFor = (number: number) =>
    pokedex.find((entry) => entry.number === number);
  const Slot = gameTheme ? GameSlot : TallGrassSlot;

  const closePreview = () => {
    if (preview) URL.revokeObjectURL(preview);

    setPreview(undefined);
  };

  const showPreview = async () => {
    if (!game) return;

    const blob = await renderTeamImage(team, game, pokedex);

    closePreview();
    setPreview(URL.createObjectURL(blob));
  };

  const updateSlot = (slot: number, member: Member | null) => {
    onTeamChange(
      team.map((current, index) => (index === slot ? member : current)),
    );
    setEditing(undefined);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setEditing(undefined);
          closePreview();
          onClose();
        }
      }}
    >
      <DialogContent
        className={cn(
          'flex flex-col sm:max-w-xl',
          gameTheme
            ? 'pokedex-game gb-frame gap-6 rounded-none p-6 ring-0'
            : 'gap-5',
        )}
      >
        <div className="mr-8 flex flex-wrap items-center gap-3">
          <DialogTitle
            className={cn(
              'mr-auto',
              gameTheme && 'text-[10px] leading-[14px] font-normal',
            )}
          >
            {TITLE}
          </DialogTitle>
          {game && team.some(Boolean) && editing === undefined && (
            <PreviewButton
              gameTheme={gameTheme}
              previewing={preview !== undefined}
              onClick={preview ? closePreview : showPreview}
            />
          )}
        </div>
        <DialogDescription className="sr-only">
          Pick the six Pokémon to record in the Hall of Fame
        </DialogDescription>
        {gamePicker}
        {!game ? (
          <ul className="grid grid-cols-2 gap-3">
            {team.map((_, slot) => (
              <li key={slot}>
                <div
                  aria-hidden
                  className="flex h-28 items-center justify-center rounded-xl border border-dashed text-muted-foreground opacity-50"
                >
                  <Plus className="size-5" />
                </div>
              </li>
            ))}
          </ul>
        ) : preview ? (
          <div className="flex flex-col gap-4">
            <img
              src={preview}
              alt="Hall of Fame image preview"
              className={cn(
                'pixelated max-h-[60svh] w-full border-2 border-dotted border-muted-foreground/40 object-contain p-2',
                !gameTheme && 'rounded-lg',
              )}
            />
            <ShareButton
              team={team}
              game={game}
              pokedex={pokedex}
              gameTheme={gameTheme}
            />
          </div>
        ) : editing === undefined ? (
          <ul
            className={cn(
              'grid grid-cols-2',
              gameTheme ? 'gap-x-6 gap-y-8 p-2' : 'gap-3',
            )}
          >
            {team.map((member, slot) => (
              <li key={slot}>
                <Slot
                  member={member}
                  entry={member ? entryFor(member.number) : undefined}
                  game={game}
                  onEdit={() => setEditing(slot)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <MemberEditor
            member={team[editing]}
            game={game}
            pokedex={pokedex}
            gameTheme={gameTheme}
            onSave={(member) => updateSlot(editing, member)}
            onRemove={() => updateSlot(editing, null)}
            onCancel={() => setEditing(undefined)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

const canShareFiles = () => {
  try {
    return (
      typeof navigator.canShare === 'function' &&
      navigator.canShare({
        files: [new File([''], 'hall-of-fame.png', { type: 'image/png' })],
      })
    );
  } catch {
    return false;
  }
};

const PreviewButton = ({
  gameTheme,
  previewing,
  onClick,
}: {
  gameTheme: boolean;
  previewing: boolean;
  onClick: () => void;
}) =>
  gameTheme ? (
    <button
      type="button"
      aria-pressed={previewing}
      onClick={onClick}
      className={gameButtonClass}
    >
      {previewing ? 'Back' : 'Preview'}
    </button>
  ) : (
    <Button variant="outline" size="sm" onClick={onClick}>
      <Eye />
      {previewing ? 'Back' : 'Preview'}
    </Button>
  );

const ShareButton = ({
  team,
  game,
  pokedex,
  gameTheme,
}: {
  team: Team;
  game: Game;
  pokedex: Array<PokedexEntry>;
  gameTheme: boolean;
}) => {
  const [status, setStatus] = useState<string>();
  const [busy, setBusy] = useState(false);

  const flash = (message: string) => {
    setStatus(message);
    setTimeout(() => setStatus(undefined), FEEDBACK_MS);
  };

  const share = async () => {
    setBusy(true);

    try {
      const blob = await renderTeamImage(team, game, pokedex);
      const name = `hall-of-fame-${game.id}.png`;

      if (canShareFiles()) {
        await navigator.share({
          files: [new File([blob], name, { type: 'image/png' })],
          title: 'Hall of Fame',
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = name;
        link.click();
        URL.revokeObjectURL(url);
        flash('Image saved!');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError')
        flash("Couldn't create the image");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-3">
      <span
        role="status"
        className={cn(
          'text-muted-foreground',
          gameTheme ? 'text-[8px] leading-none' : 'text-xs',
        )}
      >
        {status}
      </span>
      {gameTheme ? (
        <button
          type="button"
          disabled={busy}
          onClick={share}
          className={gameButtonClass}
        >
          Share Hall of Fame
        </button>
      ) : (
        <Button disabled={busy} onClick={share}>
          <Share2 />
          Share Hall of Fame
        </Button>
      )}
    </div>
  );
};

type SlotProps = {
  member: Member | null;
  entry: PokedexEntry | undefined;
  game: Game;
  onEdit: () => void;
};

const slotLabel = (member: Member | null, entry: PokedexEntry | undefined) =>
  member && entry
    ? `${entry.name}, level ${member.level}. Change`
    : 'Empty slot. Choose a Pokémon';

const GameSlot = ({ member, entry, game, onEdit }: SlotProps) => {
  const spriteFor = usePokemonSprite(game);
  const [type1, type2] = entry?.types ?? [];

  return (
    <button
      type="button"
      onClick={onEdit}
      aria-label={slotLabel(member, entry)}
      className="group flex w-full cursor-pointer items-center gap-2 text-left outline-none"
    >
      <div className="gb-frame flex h-32 w-36 shrink-0 flex-col gap-1 px-3 py-3 text-[8px] leading-[10px] transition-colors *:shrink-0 group-hover:bg-(--gb-ink)/10 group-focus-visible:bg-(--gb-ink)/10">
        {member && entry ? (
          <>
            <span className="truncate text-[9px]">{entry.name}</span>
            <span className="pl-2">Level/</span>
            <span className="self-end pr-1">{member.level}</span>
            {type1 && (
              <>
                <span className="pl-2">Type1/</span>
                <span className="pl-4">{type1}</span>
              </>
            )}
            {type2 && (
              <>
                <span className="pl-2">Type2/</span>
                <span className="pl-4">{type2}</span>
              </>
            )}
          </>
        ) : (
          <span className="m-auto text-(--gb-ink-soft)">+</span>
        )}
      </div>
      <div className="flex size-20 shrink-0 items-center justify-center">
        {member && (
          <img
            src={spriteFor(member.number).src}
            alt=""
            width={96}
            height={96}
            className="size-20 object-contain"
          />
        )}
      </div>
    </button>
  );
};

const TallGrassSlot = ({ member, entry, game, onEdit }: SlotProps) => {
  const spriteFor = usePokemonSprite(game);
  const sprite = member ? spriteFor(member.number) : undefined;

  return (
    <button
      type="button"
      onClick={onEdit}
      aria-label={slotLabel(member, entry)}
      className={cn(
        'flex h-28 w-full cursor-pointer items-center gap-3 rounded-xl p-3 text-left transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
        member && entry
          ? 'border bg-card hover:bg-muted/60'
          : 'justify-center border border-dashed text-muted-foreground hover:bg-muted/60 hover:text-foreground',
      )}
    >
      {member && entry && sprite ? (
        <>
          <img
            src={sprite.src}
            alt=""
            width={96}
            height={96}
            className={cn(
              'size-20 shrink-0 object-contain',
              sprite.pixelated && 'pixelated',
            )}
          />
          <div className="flex min-w-0 flex-col items-start gap-1.5">
            <span className="max-w-full truncate text-sm font-medium">
              {entry.name}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              Lv. {member.level}
            </span>
            <PokemonTypeTags types={entry.types} />
          </div>
        </>
      ) : (
        <Plus aria-hidden className="size-5" />
      )}
    </button>
  );
};

const LevelInput = ({
  value,
  gameTheme,
  onChange,
}: {
  value: string;
  gameTheme: boolean;
  onChange: (value: string) => void;
}) => {
  const update = (raw: string) => {
    const digits = raw.replace(/\D/g, '');

    onChange(digits ? String(clampLevel(Number(digits))) : '');
  };

  const blockInvalidKeys = (event: KeyboardEvent<HTMLInputElement>) => {
    if (BLOCKED_LEVEL_KEYS.has(event.key)) event.preventDefault();
  };

  return (
    <label
      className={cn(
        'flex items-center gap-2',
        gameTheme ? 'text-[8px] leading-none' : 'text-sm',
      )}
    >
      {gameTheme ? 'Level/' : 'Level'}
      <Input
        type="number"
        inputMode="numeric"
        min={MIN_LEVEL}
        max={MAX_LEVEL}
        value={value}
        onKeyDown={blockInvalidKeys}
        onChange={(event) => update(event.target.value)}
        onBlur={() => onChange(String(clampLevel(Number(value))))}
        className={cn('w-20', gameTheme && gameInputClass)}
      />
    </label>
  );
};

const EditorButton = ({
  gameTheme,
  primary,
  disabled,
  onClick,
  children,
}: {
  gameTheme: boolean;
  primary?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) =>
  gameTheme ? (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        gameButtonClass,
        primary && 'bg-(--gb-ink) text-(--gb-screen)',
      )}
    >
      {children}
    </button>
  ) : (
    <Button
      variant={primary ? 'default' : 'outline'}
      size="sm"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );

const MemberEditor = ({
  member,
  game,
  pokedex,
  gameTheme,
  onSave,
  onRemove,
  onCancel,
}: {
  member: Member | null;
  game: Game;
  pokedex: Array<PokedexEntry>;
  gameTheme: boolean;
  onSave: (member: Member) => void;
  onRemove: () => void;
  onCancel: () => void;
}) => {
  const spriteFor = usePokemonSprite(game);
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState(member?.number);
  const [level, setLevel] = useState(String(member?.level ?? DEFAULT_LEVEL));

  const search = query.trim().toLowerCase().replace(/^#0*/, '');
  const matches = pokedex.filter(
    ({ name, number }) =>
      !search ||
      name.toLowerCase().includes(search) ||
      String(number) === search,
  );
  const pickedEntry = pokedex.find(({ number }) => number === picked);

  return (
    <div className={cn('flex min-h-0 flex-col gap-4', gameTheme && 'px-2')}>
      <Input
        type="search"
        autoFocus
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Name or number"
        aria-label="Search Pokémon"
        className={cn(
          gameTheme && cn(gameInputClass, 'placeholder:text-(--gb-ink-soft)'),
        )}
      />
      <ul
        aria-label="Pokémon"
        className="grid h-64 grid-cols-3 content-start gap-2 overflow-y-auto pr-1 sm:grid-cols-4"
      >
        {matches.map(({ number, name }) => {
          const sprite = spriteFor(number);

          return (
            <li key={number}>
              <button
                type="button"
                aria-pressed={picked === number}
                onClick={() => setPicked(number)}
                className={cn(
                  'flex w-full cursor-pointer flex-col items-center gap-1 p-1',
                  gameTheme
                    ? 'border-2 border-transparent text-[7px] leading-[10px] hover:border-(--gb-ink) aria-pressed:border-(--gb-ink) aria-pressed:bg-(--gb-ink)/10'
                    : 'rounded-md border border-transparent text-xs hover:bg-muted aria-pressed:border-foreground aria-pressed:bg-muted',
                )}
              >
                <img
                  src={sprite.src}
                  alt=""
                  width={96}
                  height={96}
                  loading="lazy"
                  className={cn(
                    'size-10 object-contain',
                    sprite.pixelated && 'pixelated',
                  )}
                />
                <span className="w-full truncate text-center">{name}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap items-center gap-3">
        <LevelInput value={level} gameTheme={gameTheme} onChange={setLevel} />
        <span
          className={cn(
            'flex-1 truncate',
            gameTheme ? 'text-[8px] leading-none' : 'text-sm font-medium',
          )}
        >
          {pickedEntry?.name}
        </span>
        <EditorButton gameTheme={gameTheme} onClick={onCancel}>
          Back
        </EditorButton>
        {member && (
          <EditorButton gameTheme={gameTheme} onClick={onRemove}>
            Remove
          </EditorButton>
        )}
        <EditorButton
          gameTheme={gameTheme}
          primary
          disabled={picked === undefined}
          onClick={() =>
            picked !== undefined &&
            onSave({ number: picked, level: clampLevel(Number(level)) })
          }
        >
          OK
        </EditorButton>
      </div>
    </div>
  );
};
