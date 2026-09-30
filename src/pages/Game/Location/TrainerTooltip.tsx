import '@fontsource/press-start-2p';
import { useThemeStyle } from '@/components/settings/themes';
import type { Game } from '@/data/games';
import type { PokedexEntry } from '@/data/pokedex/types';
import type { TrainerParty } from '@/data/trainers/types';
import { type PokemonSprite, usePokemonSprite } from '@/hooks/usePokemonSprite';

import type { ListedBattle } from './trainerList';
import { TrainerPartyTiles } from './TrainerPartyTiles';

type TrainerTooltipProps = {
  listed: ListedBattle;
  game: Game;
  pokedex: Array<PokedexEntry>;
};

export const TrainerTooltip = ({
  listed: { battle, number },
  game,
  pokedex,
}: TrainerTooltipProps) => {
  const gameTheme = useThemeStyle('trainers') === 'game';
  const spriteFor = usePokemonSprite(game);

  const names = new Map(pokedex.map((entry) => [entry.number, entry.name]));
  const nameOf = (entry: number) => names.get(entry) ?? `#${entry}`;

  if (gameTheme) {
    return (
      <div className="pokedex-game gb-frame flex w-max max-w-64 flex-col gap-3 px-4 py-3.5 text-left">
        <span className="text-[10px] leading-[14px] whitespace-nowrap">
          {battle.name}
          {number && ` #${number}`}
        </span>
        <hr className="border-t-2 border-foreground" />
        {battle.parties.map((party) => (
          <GameParty
            key={party.label ?? ''}
            party={party}
            spriteFor={spriteFor}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex w-max max-w-64 flex-col gap-2 rounded-xl bg-popover p-3 text-left text-popover-foreground shadow-lg ring-1 ring-foreground/10">
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
      {battle.parties.map((party) => (
        <TrainerPartyTiles
          key={party.label ?? ''}
          party={party}
          spriteFor={spriteFor}
          nameOf={nameOf}
          linked={false}
          columns
        />
      ))}
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
