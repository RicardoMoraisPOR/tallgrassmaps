import { useDeferredValue, useEffect, useMemo, useState } from 'react';

import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router';

import { Container } from '@/components/Container';
import { PageTitle } from '@/components/PageTitle';
import { SelectField } from '@/components/SelectField';
import { Input } from '@/components/ui/input';
import { VirtualGrid } from '@/components/VirtualGrid';
import { species } from '@/data/pokedex/master';
import { ENTER, enterDelay } from '@/lib/enter';
import { cn } from '@/lib/utils';

import { PokemonTypeTags } from '../Game/Pokedex/PokemonTypeTags';
import { PokemonDialog } from './PokemonDialog';
import { PokemonImage } from './PokemonImage';
import { allTypes, generationOf, generations, hasType } from './pokemonProfile';
import { TYPE_TINT, typeTintStyle } from './typeTint';

const TILE_MIN_WIDTH = 120;
const TILE_HEIGHT = 176;
const TILE_GAP = 8;
const ENTER_WINDOW_MS = 600;
const MAX_STAGGERED = 24;
const STAGGER_SECONDS = 0.008;
const POKEMON_PARAM = 'pokemon';
const ANY = 'any';

const typeOptions = [
  { value: ANY, label: 'All types' },
  ...allTypes.map((type) => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1),
  })),
];

const generationOptions = [
  { value: ANY, label: 'All generations' },
  ...generations.map(({ id, label }) => ({ value: String(id), label })),
];

export const NationalPokedexPage = () => {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [type, setType] = useState(ANY);
  const [generation, setGeneration] = useState(ANY);
  const deferredQuery = useDeferredValue(query);
  const needle = deferredQuery.trim().toLowerCase().replace(/^#0*/, '');
  const selected = Number(params.get(POKEMON_PARAM)) || undefined;

  const visible = useMemo(
    () =>
      species.filter(
        (family) =>
          (!needle ||
            family.name.toLowerCase().includes(needle) ||
            String(family.number) === needle) &&
          (type === ANY || hasType(family, type)) &&
          (generation === ANY ||
            generationOf(family.number).id === Number(generation)),
      ),
    [needle, type, generation],
  );

  const [introDone, setIntroDone] = useState(false);
  const entering = !introDone;

  useEffect(() => {
    const timer = setTimeout(() => setIntroDone(true), ENTER_WINDOW_MS);

    return () => clearTimeout(timer);
  }, []);

  const select = (number: number, replace = false) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current);

        next.set(POKEMON_PARAM, String(number));

        return next;
      },
      { replace },
    );

  const close = () =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current);

        next.delete(POKEMON_PARAM);

        return next;
      },
      { replace: true },
    );

  return (
    <Container
      as="section"
      className="flex flex-col gap-6 pt-10 pb-16 sm:pt-14 sm:pb-20"
    >
      <header className="flex flex-col gap-3">
        <PageTitle>National Pokédex</PageTitle>
        <p className="text-lg text-pretty text-muted-foreground">
          Search any Pokémon to see its types, forms, evolutions, the games it
          is in and where to find it.
        </p>
      </header>
      <div className="flex flex-wrap items-center gap-2">
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
        <SelectField
          label="Type"
          value={type}
          onChange={setType}
          options={typeOptions}
        />
        <SelectField
          label="Generation"
          value={generation}
          onChange={setGeneration}
          options={generationOptions}
        />
      </div>
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {visible.length} of {species.length} Pokémon
      </p>
      {visible.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">
          No Pokémon match that search.
        </p>
      ) : (
        <VirtualGrid
          items={visible}
          itemKey={({ number }) => number}
          minColumnWidth={TILE_MIN_WIDTH}
          rowHeight={TILE_HEIGHT}
          gap={TILE_GAP}
          renderItem={({ number, name, types }, index) => (
            <button
              type="button"
              onClick={() => select(number)}
              style={{
                ...typeTintStyle(types),
                ...(entering
                  ? enterDelay(Math.min(index, MAX_STAGGERED) * STAGGER_SECONDS)
                  : undefined),
              }}
              className={cn(
                'flex h-full w-full flex-col items-center gap-1 overflow-hidden rounded-sm border bg-card p-2 text-center outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                TYPE_TINT,
                'transition-colors duration-150 motion-reduce:transition-none',
                entering && ENTER,
              )}
            >
              <PokemonImage number={number} name={name} size={80} />
              <span className="text-[11px] text-muted-foreground tabular-nums">
                #{String(number).padStart(4, '0')}
              </span>
              <span className="text-xs leading-tight font-medium">{name}</span>
              <PokemonTypeTags types={types} />
            </button>
          )}
        />
      )}
      <PokemonDialog
        number={selected}
        onSelect={(number) => select(number, true)}
        onClose={close}
      />
    </Container>
  );
};
