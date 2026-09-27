import type { Game } from '@/data/games';
import type { PokedexEntry } from '@/data/pokedex/types';
import type { TrainerBattle, TrainerParty } from '@/data/trainers/types';
import { type PokemonSprite, usePokemonSprite } from '@/hooks/usePokemonSprite';
import { cn } from '@/lib/utils';

import { ExpandableCard } from './ExpandableCard';

type TrainersCardProps = {
  game: Game;
  path: string;
  floor?: string;
  trainers: Array<TrainerBattle>;
  pokedex: Array<PokedexEntry>;
};

export const TrainersCard = ({
  game,
  path,
  floor,
  trainers,
  pokedex,
}: TrainersCardProps) => {
  const spriteFor = usePokemonSprite(game);

  const battles = trainers.filter(
    (battle) =>
      battle.path === path &&
      battle.games.includes(game.id) &&
      (!floor || battle.floor === floor),
  );

  if (battles.length === 0) return null;

  const names = new Map(pokedex.map((entry) => [entry.number, entry.name]));
  const areas = floor
    ? [{ area: undefined, battles }]
    : [...new Set(battles.map((battle) => battle.area))].map((area) => ({
        area,
        battles: battles.filter((battle) => battle.area === area),
      }));

  return (
    <ExpandableCard title="Trainer battles">
      {areas.map(({ area, battles }) => (
        <div key={area ?? ''} className="flex flex-col gap-1">
          {area && (
            <h3 className="text-[13px] text-muted-foreground">{area}</h3>
          )}
          <ul className="flex flex-col divide-y">
            {battles.map((battle, index) => (
              <li key={index} className="flex flex-col gap-2 py-2.5">
                <span className="text-sm font-medium">{battle.name}</span>
                {battle.parties.map((party) => (
                  <Party
                    key={party.label ?? ''}
                    party={party}
                    spriteFor={spriteFor}
                    nameOf={(number) => names.get(number) ?? `#${number}`}
                  />
                ))}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </ExpandableCard>
  );
};

const Party = ({
  party,
  spriteFor,
  nameOf,
}: {
  party: TrainerParty;
  spriteFor: (number: number) => PokemonSprite;
  nameOf: (number: number) => string;
}) => {
  return (
    <div className="flex flex-col gap-1">
      {party.label && (
        <span className="text-xs text-muted-foreground">{party.label}</span>
      )}
      <ul aria-label={party.label ?? 'Party'} className="flex flex-wrap gap-1">
        {party.pokemon.map((pokemon, index) => (
          <li
            key={index}
            title={`${nameOf(pokemon.number)}, Lv. ${pokemon.level}`}
            className="flex w-11 flex-col items-center rounded-lg bg-muted pt-0.5 pb-1"
          >
            <img
              src={spriteFor(pokemon.number).src}
              alt=""
              width={96}
              height={96}
              loading="lazy"
              className={cn(
                'size-9 object-contain',
                spriteFor(pokemon.number).pixelated && 'pixelated',
              )}
            />
            <span className="sr-only">{nameOf(pokemon.number)}, </span>
            <span className="text-[11px] leading-none text-muted-foreground tabular-nums">
              Lv. {pokemon.level}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
