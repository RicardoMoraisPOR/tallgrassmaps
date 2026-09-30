import type { Game } from '@/data/games';
import type { PokedexEntry } from '@/data/pokedex/types';
import { usePokemonSprite } from '@/hooks/usePokemonSprite';

import type { BattleGroup } from './trainerList';
import { TrainerPartyTiles } from './TrainerPartyTiles';

type TrainersTabProps = {
  game: Game;
  groups: Array<BattleGroup>;
  pokedex: Array<PokedexEntry>;
  onHighlight: (key: string | undefined) => void;
  onSelect: (key: string) => void;
};

export const TrainersTab = ({
  game,
  groups,
  pokedex,
  onHighlight,
  onSelect,
}: TrainersTabProps) => {
  const spriteFor = usePokemonSprite(game);

  const names = new Map(pokedex.map((entry) => [entry.number, entry.name]));

  return (
    <>
      {groups.map(({ area, battles }) => (
        <div key={area ?? ''} className="flex flex-col gap-1">
          {area && (
            <h3 className="text-[13px] text-muted-foreground">{area}</h3>
          )}
          <ul className="flex flex-col divide-y">
            {battles.map(({ battle, key, number }) => (
              <li key={key} className="flex flex-col gap-2 py-2.5">
                <button
                  type="button"
                  onClick={() => onSelect(key)}
                  {...(battle.x === undefined
                    ? {}
                    : {
                        onMouseEnter: () => onHighlight(key),
                        onMouseLeave: () => onHighlight(undefined),
                        onFocus: () => onHighlight(key),
                        onBlur: () => onHighlight(undefined),
                      })}
                  className="cursor-pointer self-start rounded-sm text-left text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  {battle.name}
                  {number && (
                    <span className="font-normal text-muted-foreground/80">
                      {' '}
                      #{number}
                    </span>
                  )}
                </button>
                {battle.parties.map((party) => (
                  <TrainerPartyTiles
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
    </>
  );
};
