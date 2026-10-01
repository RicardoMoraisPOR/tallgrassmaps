import '@fontsource/press-start-2p';
import { type ReactNode, useState } from 'react';

import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
} from 'lucide-react';
import { Link } from 'react-router';

import { Collapse } from '@/components/Collapse';
import { useThemeStyle } from '@/components/settings/themes';
import type { Game } from '@/data/games';
import type { NpcDialog, NpcTrade, NpcPokemon } from '@/data/npcs/types';
import { usePokemonSprite } from '@/hooks/usePokemonSprite';
import { cn } from '@/lib/utils';

import { usePokedexLink } from '../Pokedex/usePokedex';
import { GiftBox } from './GiftBox';

const LONG_TEXT = 60;

const pixelIcons = {
  question: {
    viewBox: '0 0 5 7',
    size: 'h-[10px] w-[7px]',
    path: 'M1 0h3v1h-3zM0 1h1v1h-1zM4 1h1v2h-1zM2 3h2v1h-2zM2 4h1v1h-1zM2 6h1v1h-1z',
  },
  previous: {
    viewBox: '0 0 4 7',
    size: 'h-[10px] w-[6px]',
    path: 'M3 0h1v7h-1zM2 1h1v5h-1zM1 2h1v3h-1zM0 3h1v1h-1z',
  },
  next: {
    viewBox: '0 0 4 7',
    size: 'h-[10px] w-[6px]',
    path: 'M0 0h1v7h-1zM1 1h1v5h-1zM2 2h1v3h-1zM3 3h1v1h-1z',
  },
  trade: {
    viewBox: '0 0 7 7',
    size: 'h-[10px] w-[10px]',
    path: 'M5 0h1v1h-1zM0 1h7v1h-7zM5 2h1v1h-1zM1 4h1v1h-1zM0 5h7v1h-7zM1 6h1v1h-1z',
  },
};

const lucideIcons = {
  question: CircleHelp,
  previous: ChevronLeft,
  next: ChevronRight,
  trade: ArrowLeftRight,
};

type IconName = keyof typeof pixelIcons;

const Icon = ({ name, gameTheme }: { name: IconName; gameTheme: boolean }) => {
  if (!gameTheme) {
    const LucideIcon = lucideIcons[name];

    return <LucideIcon className="size-3.5" />;
  }

  const { viewBox, size, path } = pixelIcons[name];

  return (
    <svg
      viewBox={viewBox}
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={size}
    >
      <path fill="currentColor" d={path} />
    </svg>
  );
};

const CardButton = ({
  label,
  gameTheme,
  disabled,
  pressed,
  onClick,
  children,
}: {
  label: string;
  gameTheme: boolean;
  disabled?: boolean;
  pressed?: boolean;
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    aria-pressed={pressed}
    disabled={disabled}
    onClick={onClick}
    className={cn(
      'flex shrink-0 cursor-pointer items-center justify-center transition-colors disabled:cursor-default disabled:opacity-30',
      gameTheme
        ? 'size-[22px] border-2 border-(--gb-ink) text-(--gb-ink) enabled:hover:bg-(--gb-ink) enabled:hover:text-(--gb-screen) aria-pressed:bg-(--gb-ink) aria-pressed:text-(--gb-screen)'
        : 'size-6 rounded-md border border-border bg-muted/60 text-foreground enabled:hover:bg-muted aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background aria-pressed:hover:bg-foreground/85',
    )}
  >
    {children}
  </button>
);

const PokemonTile = ({
  pokemon: { number, name },
  game,
  gameTheme,
}: {
  pokemon: NpcPokemon;
  game: Game;
  gameTheme: boolean;
}) => {
  const sprite = usePokemonSprite(game)(number);
  const pokedexLink = usePokedexLink(number);

  return (
    <Link
      {...pokedexLink}
      title={name}
      aria-label={`${name} in the Pokédex`}
      className={cn(
        'flex items-center justify-center p-0.5 transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
        gameTheme
          ? 'border-2 border-(--gb-ink) hover:bg-(--gb-ink)/15'
          : 'rounded-md border border-border bg-muted/60 hover:bg-muted',
      )}
    >
      <img
        src={sprite.src}
        alt=""
        className={cn('size-8 object-contain', sprite.pixelated && 'pixelated')}
      />
    </Link>
  );
};

const TradeSquare = ({
  trade,
  game,
  gameTheme,
}: {
  trade: NpcTrade;
  game: Game;
  gameTheme: boolean;
}) => (
  <div
    aria-label={`Trade: your ${trade.give.name} for ${trade.receive.name}`}
    className="flex items-center justify-center gap-2"
  >
    <PokemonTile pokemon={trade.give} game={game} gameTheme={gameTheme} />
    <Icon name="trade" gameTheme={gameTheme} />
    <PokemonTile pokemon={trade.receive} game={game} gameTheme={gameTheme} />
  </div>
);

const PokemonSquare = ({
  pokemon,
  game,
  gameTheme,
}: {
  pokemon: NpcPokemon;
  game: Game;
  gameTheme: boolean;
}) => (
  <div aria-label={`Pokémon: ${pokemon.name}`} className="flex justify-center">
    <PokemonTile pokemon={pokemon} game={game} gameTheme={gameTheme} />
  </div>
);

type MapTextTooltipProps = {
  name?: string;
  text?: string;
  dialog?: Array<NpcDialog>;
  game?: Game;
};

export const MapTextTooltip = ({
  name,
  text,
  dialog = [],
  game,
}: MapTextTooltipProps) => {
  const gameTheme = useThemeStyle('mapIcons') === 'game';
  const [page, setPage] = useState(0);
  const [showingTriggers, setShowingTriggers] = useState(false);

  const current = dialog[page];
  const shownText = current?.text ?? text;
  const trigger = showingTriggers ? current?.trigger : undefined;
  const muted = Boolean(name) || (shownText?.length ?? 0) > LONG_TEXT;
  const paged = dialog.length > 1;

  const toggle = dialog.some((entry) => entry.trigger) && (
    <CardButton
      label="How to trigger this dialog"
      gameTheme={gameTheme}
      pressed={showingTriggers}
      onClick={() => setShowingTriggers((showing) => !showing)}
    >
      <Icon name="question" gameTheme={gameTheme} />
    </CardButton>
  );

  const disclaimer = (
    <Collapse open={Boolean(trigger)} className="pb-2">
      <p
        className={cn(
          'whitespace-pre-line text-muted-foreground',
          gameTheme
            ? 'border-2 border-dashed border-(--gb-ink) px-2 py-1.5 text-[8px] leading-[12px]'
            : 'rounded-md bg-muted px-2 py-1 text-xs italic',
        )}
      >
        {trigger}
      </p>
    </Collapse>
  );

  const header = (name || toggle) && (
    <div className="flex items-center gap-2">
      {name && (
        <span
          className={cn(
            'mr-1 flex-1 whitespace-nowrap',
            gameTheme ? 'text-[10px] leading-[14px]' : 'text-sm font-medium',
          )}
        >
          {name}
        </span>
      )}
      {toggle}
    </div>
  );

  const body = shownText && (
    <p
      key={page}
      className={cn(
        'whitespace-pre-line',
        gameTheme ? 'text-[8px] leading-[14px]' : 'text-xs',
        muted && 'text-muted-foreground',
        paged && 'max-h-40 overflow-y-auto pr-1',
      )}
    >
      {shownText}
    </p>
  );

  const giftSquare = current?.gift && (
    <GiftBox gift={current.gift} gameTheme={gameTheme} />
  );

  const pokemonSquare = current?.pokemon && game && (
    <PokemonSquare
      pokemon={current.pokemon}
      game={game}
      gameTheme={gameTheme}
    />
  );

  const tradeSquare = current?.trade && game && (
    <TradeSquare trade={current.trade} game={game} gameTheme={gameTheme} />
  );

  const pager = paged && (
    <div className="flex items-center justify-center gap-2">
      <CardButton
        label="Previous dialog"
        gameTheme={gameTheme}
        disabled={page === 0}
        onClick={() => setPage(page - 1)}
      >
        <Icon name="previous" gameTheme={gameTheme} />
      </CardButton>
      <span
        className={cn(
          'min-w-8 text-center tabular-nums',
          gameTheme ? 'text-[8px] leading-[14px]' : 'text-xs',
        )}
      >
        {page + 1}/{dialog.length}
      </span>
      <CardButton
        label="Next dialog"
        gameTheme={gameTheme}
        disabled={page === dialog.length - 1}
        onClick={() => setPage(page + 1)}
      >
        <Icon name="next" gameTheme={gameTheme} />
      </CardButton>
    </div>
  );

  return (
    <div
      className={cn(
        'flex flex-col',
        gameTheme
          ? 'pokedex-game gb-frame gap-2 px-3.5 py-2.5'
          : 'gap-1.5 rounded-lg bg-popover px-2.5 py-1.5 text-popover-foreground shadow-lg ring-1 ring-foreground/10',
        paged
          ? { 'w-64': gameTheme, 'w-60': !gameTheme }
          : { 'w-max': true, 'max-w-64': gameTheme, 'max-w-60': !gameTheme },
      )}
    >
      {header && (
        <div className="flex flex-col">
          {disclaimer}
          {header}
        </div>
      )}
      {body}
      {giftSquare}
      {tradeSquare}
      {pokemonSquare}
      {pager && <div className={cn(!gameTheme && 'pt-1')}>{pager}</div>}
    </div>
  );
};
