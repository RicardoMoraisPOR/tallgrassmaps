import { type ReactNode, useMemo } from 'react';

import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { getSpecies } from '@/data/pokedex/master';
import type { Species } from '@/data/pokedex/types';
import { pokeapiSprite } from '@/data/sprites';
import { gameHref } from '@/lib/paths';

import { bulbapediaUrl, dexNumber } from '../Game/Pokedex/format';
import { PokemonTypeTags } from '../Game/Pokedex/PokemonTypeTags';
import { EvolutionLine } from './EvolutionLine';
import { PokemonImage } from './PokemonImage';
import { PokemonLocations } from './PokemonLocations';
import {
  appearancesOf,
  evolutionParent,
  evolutionTree,
  formsOf,
  generationOf,
  nameOf,
  spotsOf,
  spritesFor,
} from './pokemonProfile';
import { SpritesSection } from './SpritesSection';

const HERO_SIZE = 96;

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="flex flex-col gap-2.5">
    <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
      {title}
    </h3>
    {children}
  </section>
);

type PokemonDetailsProps = {
  family: Species;
  onSelect: (number: number) => void;
};

const PokemonDetails = ({ family, onSelect }: PokemonDetailsProps) => {
  const { number, name } = family;
  const generation = generationOf(number);
  const appearances = useMemo(() => appearancesOf(number), [number]);
  const tree = useMemo(() => evolutionTree(number), [number]);
  const spots = useMemo(() => spotsOf(number), [number]);
  const sprites = useMemo(() => spritesFor(family), [family]);
  const forms = useMemo(() => formsOf(family), [family]);
  const previous = getSpecies(number - 1);
  const next = getSpecies(number + 1);
  const parent = evolutionParent(number);
  const emptyNote = parent
    ? `Not found in the wild. Evolve ${nameOf(parent)}.`
    : 'No locations mapped yet.';
  const games = appearances.flatMap((appearance) => appearance.games);

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="flex size-32 flex-none items-center justify-center rounded-lg bg-muted/40">
          <PokemonImage number={number} name={name} size={HERO_SIZE} />
        </div>
        <div className="flex min-w-0 flex-col items-start gap-2">
          <div className="flex flex-col gap-0.5">
            <DialogTitle className="font-heading text-2xl leading-tight font-bold tracking-tight">
              {name}
            </DialogTitle>
            <DialogDescription>
              {dexNumber(number)} · {generation.label}
            </DialogDescription>
          </div>
          <PokemonTypeTags types={family.types} />
          <div className="flex flex-wrap gap-1.5">
            <Button variant="outline" size="sm" asChild>
              <a href={bulbapediaUrl(name)} target="_blank" rel="noreferrer">
                Bulbapedia
                <ExternalLink aria-hidden />
              </a>
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={!previous}
              aria-label={previous ? `Previous: ${previous.name}` : 'Previous'}
              title={previous?.name}
              onClick={() => previous && onSelect(previous.number)}
            >
              <ChevronLeft aria-hidden />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={!next}
              aria-label={next ? `Next: ${next.name}` : 'Next'}
              title={next?.name}
              onClick={() => next && onSelect(next.number)}
            >
              <ChevronRight aria-hidden />
            </Button>
          </div>
        </div>
      </div>

      {forms.length > 0 && (
        <Section title="Forms">
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {forms.map((form) => (
              <li
                key={form.name}
                className="flex items-center gap-2 rounded-lg border p-2"
              >
                {form.spriteId && (
                  <img
                    src={pokeapiSprite(form.spriteId)}
                    alt=""
                    width={48}
                    height={48}
                    loading="lazy"
                    className="size-12 flex-none [image-rendering:pixelated]"
                  />
                )}
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-xs leading-tight font-medium">
                    {form.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {form.stone ?? form.kind}
                  </span>
                  {form.types && <PokemonTypeTags types={form.types} />}
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {tree && (
        <Section title="Evolution line">
          <EvolutionLine tree={tree} current={number} onSelect={onSelect} />
        </Section>
      )}

      <Section title="In the Pokédex of">
        {games.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {games.map((game) => (
              <li key={game.id}>
                <Link
                  to={`${gameHref(game.id)}?pokedex=${number}`}
                  title={`Open ${name} in the ${game.fullName} Pokédex`}
                  className="flex items-center gap-2 rounded-full border px-3 py-1 text-xs hover:bg-muted/60"
                >
                  <span
                    aria-hidden
                    className="size-2 rounded-full"
                    style={{ background: game.colors[0] }}
                  />
                  {game.fullName}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">
            Not in a mapped Pokédex yet.
          </p>
        )}
      </Section>

      {appearances.length > 0 && (
        <Section title="Where to find it">
          <PokemonLocations spots={spots} emptyNote={emptyNote} />
        </Section>
      )}

      <SpritesSection name={name} sprites={sprites} />
    </>
  );
};

type PokemonDialogProps = {
  number: number | undefined;
  onSelect: (number: number) => void;
  onClose: () => void;
};

export const PokemonDialog = ({
  number,
  onSelect,
  onClose,
}: PokemonDialogProps) => {
  const family = number ? getSpecies(number) : undefined;

  return (
    <Dialog open={Boolean(family)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90svh] flex-col gap-5 overflow-y-auto p-5 sm:max-w-2xl">
        {family && (
          <PokemonDetails
            key={family.number}
            family={family}
            onSelect={onSelect}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
