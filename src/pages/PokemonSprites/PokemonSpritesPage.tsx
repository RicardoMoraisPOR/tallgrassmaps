import { useMemo, useState } from 'react';

import { Search } from 'lucide-react';

import { Container } from '@/components/Container';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { type Game, games } from '@/data/games';
import { getRegion } from '@/data/maps';
import { pokedexFor } from '@/data/pokedex';
import { species } from '@/data/pokedex/master';
import type {
  RegionalForm,
  Species,
  Transformation,
} from '@/data/pokedex/types';
import {
  gameSprite,
  megaSprite,
  pokeapiSprite,
  zaFormSprite,
} from '@/data/sprites';
import { cn } from '@/lib/utils';

type Sprite = { src: string; pixelArt: boolean };

type Tile = {
  key: string;
  family: Species;
  name: string;
  badge?: string;
  sprite: Sprite | undefined;
};

const megaKey = (number: number, form?: string) =>
  `${number}${form ? `-${form.toLowerCase()}` : ''}`;

type SourceSprites = {
  id: string;
  label: string;
  base: (number: number) => Sprite | undefined;
  regional: (form: RegionalForm) => Sprite | undefined;
  mega: (number: number, form: Transformation) => Sprite | undefined;
};

const pokeapiTile = (id: number | undefined): Sprite | undefined =>
  id ? { src: pokeapiSprite(id), pixelArt: true } : undefined;

const gameSource = (game: Game): SourceSprites => {
  const region = getRegion(game.region);
  const entries = (region && pokedexFor(region.versionGroup)) ?? [];
  const numbers = new Set(entries.map(({ number }) => number));
  const megas = new Set(
    entries.flatMap(({ number, megas: forms }) =>
      (forms ?? []).map(({ form }) => megaKey(number, form)),
    ),
  );

  return {
    id: game.id,
    label: game.fullName,
    base: (number) => {
      const src = numbers.has(number) ? gameSprite(number, game) : undefined;

      return src
        ? { src, pixelArt: game.sprites?.pixelated ?? true }
        : undefined;
    },
    regional: ({ spriteId }) => {
      const src = zaFormSprite(spriteId);

      return game.id === 'legends-za' && src
        ? { src, pixelArt: false }
        : undefined;
    },
    mega: (number, { form }) =>
      megas.has(megaKey(number, form))
        ? { src: megaSprite(number, form), pixelArt: false }
        : undefined,
  };
};

const SOURCES: Array<SourceSprites> = [
  {
    id: 'pokeapi',
    label: 'PokeAPI',
    base: pokeapiTile,
    regional: ({ spriteId }) => pokeapiTile(spriteId),
    mega: (_number, { spriteId }) => pokeapiTile(spriteId),
  },
  ...games.filter(({ sprites }) => sprites).map(gameSource),
];

const tilesFor = (family: Species, sprites: SourceSprites): Array<Tile> => [
  {
    key: String(family.number),
    family,
    name: family.name,
    sprite: sprites.base(family.number),
  },
  ...(family.regionalForms ?? []).map((form) => ({
    key: `${family.number}-${form.name}`,
    family,
    name: form.name,
    badge: 'Regional',
    sprite: sprites.regional(form),
  })),
  ...(family.transformations ?? []).map((form) => ({
    key: `${family.number}-${form.name}`,
    family,
    name: form.name,
    badge: 'Mega',
    sprite: sprites.mega(family.number, form),
  })),
];

const SIZES = [64, 96, 128, 192];

type Show = 'all' | 'available' | 'missing';

const SHOW_OPTIONS: Array<{ value: Show; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'available', label: 'Only available' },
  { value: 'missing', label: 'Only missing' },
];

const SelectField = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) => (
  <label className="flex items-center gap-2 text-[13px] text-muted-foreground">
    {label}
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

const caption = ({ family, badge }: Tile) =>
  `#${String(family.number).padStart(4, '0')}${badge ? ` · ${badge}` : ''}`;

const SpriteImage = ({
  tile,
  size,
  className,
}: {
  tile: Tile;
  size?: number;
  className?: string;
}) => {
  const [failed, setFailed] = useState<string>();
  const sprite = tile.sprite;

  if (!sprite || failed === sprite.src) return null;

  return (
    <img
      src={sprite.src}
      alt={tile.name}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(sprite.src)}
      className={cn(
        'size-full object-contain',
        sprite.pixelArt && '[image-rendering:pixelated]',
        className,
      )}
    />
  );
};

export const PokemonSpritesPage = () => {
  const [source, setSource] = useState('pokeapi');
  const [query, setQuery] = useState('');
  const [size, setSize] = useState(96);
  const [show, setShow] = useState<Show>('all');
  const [selected, setSelected] = useState<Tile>();

  const sprites = SOURCES.find(({ id }) => id === source) ?? SOURCES[0];
  const needle = query.trim().toLowerCase().replace(/^#0*/, '');

  const tiles = useMemo(
    () => species.flatMap((family) => tilesFor(family, sprites)),
    [sprites],
  );
  const visible = useMemo(
    () =>
      tiles.filter(
        ({ family, sprite }) =>
          (!needle ||
            family.name.toLowerCase().includes(needle) ||
            String(family.number) === needle) &&
          (show === 'all' || (show === 'available') === Boolean(sprite)),
      ),
    [tiles, needle, show],
  );
  const available = tiles.filter(({ sprite }) => sprite).length;

  return (
    <Container className="flex flex-col gap-5 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Pokémon Sprites
        </h1>
        <p className="text-sm text-muted-foreground">
          Dev page. {available} of {tiles.length} Pokémon, regional forms and
          Megas have a sprite in this source, {visible.length} shown.
        </p>
      </header>
      <div className="flex flex-wrap items-center gap-2">
        <SelectField
          label="Sprites from"
          value={source}
          onChange={setSource}
          options={SOURCES.map(({ id, label }) => ({ value: id, label }))}
        />
        <SelectField
          label="Size"
          value={String(size)}
          onChange={(value) => setSize(Number(value))}
          options={SIZES.map((option) => ({
            value: String(option),
            label: `${option}px`,
          }))}
        />
        <SelectField
          label="Show"
          value={show}
          onChange={(value) => setShow(value as Show)}
          options={SHOW_OPTIONS}
        />
        <div className="relative min-w-56 flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or number…"
            aria-label="Search Pokémon"
            className="h-9 pl-8"
          />
        </div>
      </div>
      <ul
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${size + 24}px, 1fr))`,
        }}
      >
        {visible.map((tile) => (
          <li key={tile.key}>
            <button
              type="button"
              onClick={() => setSelected(tile)}
              className={cn(
                'flex w-full flex-col items-center gap-1 rounded-[10px] border bg-card p-2 text-center outline-none hover:bg-muted/60 focus-visible:ring-[3px] focus-visible:ring-ring/50',
                !tile.sprite && 'border-dashed',
              )}
            >
              <div
                className="flex items-center justify-center"
                style={{ width: size, height: size }}
              >
                <SpriteImage tile={tile} size={size} />
              </div>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {caption(tile)}
              </span>
              <span className="text-xs leading-tight font-medium">
                {tile.name}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(undefined)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
            <DialogDescription>
              {selected && caption(selected)}
              {selected && !selected.sprite && ' · no sprite in this source'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex aspect-square w-full items-center justify-center rounded-[10px] bg-muted/40">
            {selected && <SpriteImage key={selected.key} tile={selected} />}
          </div>
        </DialogContent>
      </Dialog>
    </Container>
  );
};
