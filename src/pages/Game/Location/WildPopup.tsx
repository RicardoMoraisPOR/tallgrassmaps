import '@fontsource/press-start-2p';
import type { ComponentType } from 'react';

import {
  Building2,
  FishingRod,
  Gift,
  Leaf,
  Mountain,
  Sparkles,
  Waves,
} from 'lucide-react';

import { useThemeStyle } from '@/components/settings/themes';
import type { Game } from '@/data/games';
import type { WildTerrain } from '@/data/maps';
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
  note?: string;
  terrain?: WildTerrain;
};

const terrainLabels: Record<WildTerrain, string> = {
  grass: 'Grass',
  cavern: 'Cavern',
  indoors: 'Indoors',
};

const methodIcons: Partial<Record<Encounter['method'], ComponentType>> = {
  surf: Waves,
  'old-rod': FishingRod,
  'good-rod': FishingRod,
  'super-rod': FishingRod,
};

const terrainIcons: Record<WildTerrain, ComponentType> = {
  grass: Leaf,
  cavern: Mountain,
  indoors: Building2,
};

const AccentTile = ({
  accent,
  icon: Icon,
}: {
  accent: string;
  icon: ComponentType<{ className?: string }>;
}) => (
  <span
    aria-hidden
    className="grid size-7 flex-none place-items-center rounded-sm"
    style={{
      background: `color-mix(in oklch, var(${accent}) 22%, transparent)`,
      color: `var(${accent})`,
    }}
  >
    <Icon className="size-4" />
  </span>
);

const gameLevelLabel = ({ levels }: Encounter) => {
  if (!levels) return undefined;

  const [min, max] = levels;

  return min === max ? `:L${min}` : `:L${min}-${max}`;
};

export const WildPopup = ({
  game,
  path,
  groups,
  note,
  terrain = 'grass',
}: WildPopupProps) => {
  const gameTheme = useThemeStyle('pokemonPopups') === 'game';

  const titleOf = (group: EncounterGroup) =>
    methodLabel({ method: group.method, path, games: [] });

  const waterGroups = groups.filter(({ method }) => method !== 'walk');
  const titleFor = ({ method }: EncounterGroup) => {
    if (method === 'walk') return terrainLabels[terrain];
    if (method === 'surf' || waterGroups.length === 1) return 'Water';

    return `Water (${methodLabel({ method, path, games: [] })})`;
  };

  return gameTheme ? (
    <GameWildPopup game={game} groups={groups} titleOf={titleOf} note={note} />
  ) : (
    <div className="w-68 rounded-sm bg-popover py-3 pr-1.5 pl-3 text-popover-foreground shadow-lg ring-1 ring-foreground/10">
      <div className="flex max-h-56 flex-col gap-3 overflow-y-auto pr-2">
        {groups.map((group) => (
          <section key={group.method} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5">
              <AccentTile
                accent="--map-wild-pokemon"
                icon={methodIcons[group.method] ?? terrainIcons[terrain]}
              />
              <h3 className="text-sm leading-snug font-medium">
                {titleFor(group)}
              </h3>
            </div>
            <EncounterList game={game} rows={group.rows} compact linked />
          </section>
        ))}
      </div>
      {note && (
        <p className="mt-2 mr-1.5 border-t pt-2 text-xs text-muted-foreground italic">
          {note}
        </p>
      )}
    </div>
  );
};

const GameWildPopup = ({
  game,
  groups,
  titleOf,
  note,
}: {
  game: Game;
  groups: Array<EncounterGroup>;
  titleOf: (group: EncounterGroup) => string;
  note?: string;
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
      {note && <p className="pt-3 text-[8px] leading-[12px]">{note}</p>}
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
  if (kind === 'static') return 'One-time encounter, gone after the battle';

  return pokemon.length > 1 ? 'Gift, choose one' : 'Gift';
};

export const StaticPopup = ({ game, marker, pokedex }: StaticPopupProps) => {
  const gameTheme = useThemeStyle('pokemonPopups') === 'game';
  const spriteFor = usePokemonSprite(game);

  const nameOf = (number: number) =>
    pokedex.find((entry) => entry.number === number)?.name ?? `#${number}`;
  const typesOf = (number: number) =>
    pokedex.find((entry) => entry.number === number)?.types ?? [];
  const note = staticNote(marker);
  const isGift = marker.kind !== 'static';

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
    <div className="flex w-60 flex-col gap-2.5 rounded-sm bg-popover p-3 text-popover-foreground shadow-lg ring-1 ring-foreground/10">
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
                <span className="ml-auto flex shrink-0 items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5 text-[10px] leading-none font-medium tracking-wide text-muted-foreground uppercase">
                  {isGift ? (
                    <Gift className="size-2.5" />
                  ) : (
                    <Sparkles className="size-2.5" />
                  )}
                  {isGift ? 'Gift' : 'Static'}
                </span>
              </div>
              <PokemonTypeTags types={typesOf(number)} />
            </div>
          </div>
        );
      })}
      {note !== 'Gift' && (
        <span className="border-t pt-2 text-xs text-muted-foreground italic">
          {note}
        </span>
      )}
    </div>
  );
};
