import '@fontsource/press-start-2p';
import { useThemeStyle } from '@/components/settings/themes';
import type { Game } from '@/data/games';
import type { Encounter, PokedexEntry } from '@/data/pokedex/types';
import type { StaticPokemon } from '@/data/static-pokemon/types';
import { usePokemonSprite } from '@/hooks/usePokemonSprite';
import { cn } from '@/lib/utils';

import { chanceLabel, methodLabel } from '../Pokedex/format';
import { PokemonTypeTags } from '../Pokedex/PokemonTypeTags';
import type { EncounterGroup } from './encounters';
import { EncounterList } from './EncountersTab';
import { PokedexEntryLink } from './PokedexEntryLink';

type WildPopupProps = {
  game: Game;
  path: string;
  groups: Array<EncounterGroup>;
};

const gameLevelLabel = ({ levels }: Encounter) => {
  if (!levels) return undefined;

  const [min, max] = levels;

  return min === max ? `:L${min}` : `:L${min}-${max}`;
};

export const WildPopup = ({ game, path, groups }: WildPopupProps) => {
  const gameTheme = useThemeStyle('wildPokemon') === 'game';

  const titleOf = (group: EncounterGroup) =>
    methodLabel({ method: group.method, path, games: [] });

  return gameTheme ? (
    <GameWildPopup game={game} groups={groups} titleOf={titleOf} />
  ) : (
    <div className="w-68 rounded-xl bg-popover py-3 pr-1.5 pl-3 text-popover-foreground shadow-lg ring-1 ring-foreground/10">
      <div className="flex max-h-56 flex-col gap-3 overflow-y-auto pr-2">
        {groups.map((group) => (
          <section key={group.method} className="flex flex-col gap-1">
            <h3 className="text-[13px] text-muted-foreground">
              {titleOf(group)}
            </h3>
            <EncounterList game={game} rows={group.rows} compact linked />
          </section>
        ))}
      </div>
    </div>
  );
};

const GameWildPopup = ({
  game,
  groups,
  titleOf,
}: {
  game: Game;
  groups: Array<EncounterGroup>;
  titleOf: (group: EncounterGroup) => string;
}) => {
  const spriteFor = usePokemonSprite(game);

  return (
    <div className="pokedex-game gb-frame w-72 px-4 py-3.5">
      <div className="flex max-h-52 flex-col gap-4 overflow-y-auto pr-2">
        {groups.map((group) => (
          <section key={group.method} className="flex flex-col gap-3">
            <h3 className="text-[10px] leading-none">{titleOf(group)}</h3>
            <ul className="flex flex-col divide-y divide-current/20">
              {group.rows.map(({ entry, encounter }) => (
                <li
                  key={entry.number}
                  className="flex items-center gap-2 py-2 first:pt-0 last:pb-0"
                >
                  <img
                    src={spriteFor(entry.number).src}
                    alt=""
                    width={96}
                    height={96}
                    loading="lazy"
                    className="size-8 flex-none object-contain"
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-1 leading-none">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <PokedexEntryLink
                        number={entry.number}
                        className="truncate text-[10px] leading-[14px]"
                      >
                        {entry.name}
                      </PokedexEntryLink>
                      <span className="shrink-0 text-[8px]">
                        {gameLevelLabel(encounter)}
                      </span>
                    </div>
                    <PokemonTypeTags types={entry.types} />
                  </div>
                  <span className="text-[8px] leading-none">
                    {chanceLabel(encounter)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
};

type StaticPopupProps = {
  game: Game;
  marker: StaticPokemon;
  pokedex: Array<PokedexEntry>;
};

const staticNote = ({ kind, note, pokemon }: StaticPokemon) => {
  if (note) return note;
  if (kind === 'static') return 'One-time encounter';

  return pokemon.length > 1 ? 'Gift, choose one' : 'Gift';
};

export const StaticPopup = ({ game, marker, pokedex }: StaticPopupProps) => {
  const gameTheme = useThemeStyle('wildPokemon') === 'game';
  const spriteFor = usePokemonSprite(game);

  const nameOf = (number: number) =>
    pokedex.find((entry) => entry.number === number)?.name ?? `#${number}`;
  const typesOf = (number: number) =>
    pokedex.find((entry) => entry.number === number)?.types ?? [];
  const note = staticNote(marker);

  return gameTheme ? (
    <div className="pokedex-game gb-frame m-2 flex w-52 flex-col gap-3 px-4 py-3.5">
      {marker.pokemon.map(({ number, level }) => (
        <div key={number} className="flex items-center gap-3">
          <img
            src={spriteFor(number).src}
            alt=""
            width={96}
            height={96}
            loading="lazy"
            className="size-10 flex-none object-contain"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-2 leading-none">
            <PokedexEntryLink
              number={number}
              className="truncate text-[10px] leading-[14px]"
            >
              {nameOf(number)}
            </PokedexEntryLink>
            <span className="text-[8px]">:L{level}</span>
            <PokemonTypeTags types={typesOf(number)} />
          </div>
        </div>
      ))}
      <span className="text-[8px] leading-[12px]">{note}</span>
    </div>
  ) : (
    <div className="flex w-52 flex-col gap-2">
      {marker.pokemon.map(({ number, level }) => {
        const sprite = spriteFor(number);

        return (
          <div key={number} className="flex items-center gap-3">
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
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex min-w-0 items-center gap-2">
                <PokedexEntryLink
                  number={number}
                  className="truncate text-sm font-medium"
                >
                  {nameOf(number)}
                </PokedexEntryLink>
                <span className="shrink-0 text-xs text-muted-foreground">
                  Lv. {level}
                </span>
              </div>
              <PokemonTypeTags types={typesOf(number)} />
            </div>
          </div>
        );
      })}
      <span className="text-xs text-muted-foreground">{note}</span>
    </div>
  );
};
