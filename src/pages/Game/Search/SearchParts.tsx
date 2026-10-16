import { Backpack, CircleDot, MapPin, Swords, Users } from 'lucide-react';

import { ColorStripe } from '@/components/GameCover';
import { versionGroupNames } from '@/data/catalog/versionGroups';
import type { Game } from '@/data/games';
import type { MapItem } from '@/data/items/types';
import type { Region } from '@/data/maps';
import type { MapNpc } from '@/data/npcs/types';
import type { PokedexEntry } from '@/data/pokedex/types';
import { usePokemonSprite } from '@/hooks/usePokemonSprite';
import { cn, formatList } from '@/lib/utils';

import { ColorDot } from '../ColorDot';
import type { ListedBattle } from '../Location/trainerList';
import { TrainerSprite } from '../Location/TrainerSprite';
import { groupOf, type Place, type placeGroupsFor } from '../places';
import { PlaceIcon } from '../Region/PlaceIcon';
import { type SearchTab, TABS } from './usePlaceSearch';

const TAB_ICONS = {
  Locations: MapPin,
  Pokémon: CircleDot,
  Trainers: Swords,
  Items: Backpack,
  NPCs: Users,
};

type PlaceResultProps = {
  result: Place;
  placeGroups: ReturnType<typeof placeGroupsFor>;
  parent?: string;
};

export const PlaceResult = ({
  result,
  placeGroups,
  parent,
}: PlaceResultProps) => (
  <>
    <PlaceIcon
      shape={groupOf(placeGroups, result.location.kind).icon}
      className="text-muted-foreground"
    />
    <span className="min-w-0 flex-1 truncate">
      {result.location.name}
      {parent && <span className="text-muted-foreground"> · {parent}</span>}
    </span>
  </>
);

type TrainerResultProps = {
  listed: ListedBattle;
  place: string;
};

export const TrainerResult = ({ listed, place }: TrainerResultProps) => (
  <>
    {listed.battle.sprite ? (
      <TrainerSprite src={listed.battle.sprite} />
    ) : (
      <span aria-hidden className="size-8 flex-none" />
    )}
    <span className="min-w-0 flex-1 truncate">
      {listed.label}
      {place && <span className="text-muted-foreground"> · {place}</span>}
    </span>
  </>
);

type ItemResultProps = {
  item: MapItem;
  place: string;
};

export const ItemResult = ({ item, place }: ItemResultProps) => (
  <>
    {item.sprite ? (
      <TrainerSprite src={item.sprite} />
    ) : (
      <Backpack
        aria-hidden
        className="mx-1.5 size-5 flex-none text-muted-foreground"
      />
    )}
    <span className="min-w-0 flex-1 truncate">
      {item.item}
      {item.hidden && <span className="text-muted-foreground"> (hidden)</span>}
      {place && <span className="text-muted-foreground"> · {place}</span>}
    </span>
  </>
);

type NpcResultProps = {
  npc: MapNpc;
  place: string;
};

export const NpcResult = ({ npc, place }: NpcResultProps) => (
  <>
    <TrainerSprite src={npc.sprite} />
    <span className="min-w-0 flex-1 truncate">
      {npc.name}
      {place && <span className="text-muted-foreground"> · {place}</span>}
    </span>
  </>
);

type PokemonResultProps = {
  entry: PokedexEntry;
  game: Game;
};

export const PokemonResult = ({ entry, game }: PokemonResultProps) => {
  const sprite = usePokemonSprite(game)(entry.number, entry.form?.spriteId);

  return (
    <>
      <img
        src={sprite.src}
        alt=""
        loading="lazy"
        className={cn(
          'size-8 flex-none object-contain',
          sprite.pixelated && 'pixelated',
        )}
      />
      <span className="min-w-0 flex-1 truncate">{entry.name}</span>
      <span className="flex-none text-xs text-muted-foreground tabular-nums">
        #{entry.id}
        {entry.number !== entry.id && ` · National #${entry.number}`}
      </span>
    </>
  );
};

type SearchTabsProps = {
  tab: SearchTab | null;
  onChange: (tab: SearchTab | null) => void;
};

export const SearchTabs = ({ tab, onChange }: SearchTabsProps) => (
  <div
    role="tablist"
    aria-label="Search category"
    className="flex border-b bg-muted/30 px-2 pt-1.5"
  >
    {TABS.map((name) => {
      const Icon = TAB_ICONS[name];
      const selected = name === tab;

      return (
        <button
          key={name}
          type="button"
          role="tab"
          aria-selected={selected}
          onClick={() => onChange(selected ? null : name)}
          className={cn(
            '-mb-px flex h-9 flex-1 items-center justify-center gap-1.5 rounded-t-sm border border-b-0 px-2 text-xs font-medium',
            selected
              ? 'border-border bg-background text-foreground'
              : 'border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground',
          )}
        >
          <Icon aria-hidden className="size-3.5 flex-none" />
          <span className="truncate">{name}</span>
        </button>
      );
    })}
  </div>
);

export const SearchScope = ({
  game,
  region,
}: {
  game: Game;
  region: Region;
}) => (
  <div
    title={`Searching ${game.fullName} · same maps in ${formatList(versionGroupNames(region.versionGroup))}`}
    className="bg-muted/40"
  >
    <ColorStripe colors={game.colors} />
    <p className="flex items-center gap-3 px-4 py-2.5 text-xs">
      <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
        Searching in
      </span>
      <span className="flex min-w-0 items-center gap-1.5 truncate text-sm font-medium">
        <ColorDot color={game.colors[0]} />
        <span className="truncate">{game.fullName}</span>
      </span>
    </p>
  </div>
);
