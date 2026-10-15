import type { CSSProperties } from 'react';

import { ChevronRight } from 'lucide-react';

import { getSpecies } from '@/data/pokedex/master';
import type { Evolution } from '@/data/pokedex/types';
import { cn } from '@/lib/utils';

import { evolutionLabel, evolutionTrigger } from '../Game/Pokedex/format';
import { PokemonImage } from './PokemonImage';
import { type EvolutionNode, nameOf } from './pokemonProfile';
import { SELECTED_TINT, typeTintStyle } from './typeTint';

const GRID_FROM = 3;
const ROW_GAP = 12;
const PLATE_SIZE = 76;
const SPRITE_SIZE = 64;

const bracketStyle = (index: number, count: number): CSSProperties => {
  const centre = PLATE_SIZE / 2;
  const first = index === 0;
  const last = index === count - 1;

  return {
    top: first ? centre : -ROW_GAP,
    ...(last ? { height: centre + ROW_GAP } : { bottom: -ROW_GAP }),
  };
};

type EvolutionLineProps = {
  tree: EvolutionNode;
  current: number;
  onSelect: (number: number) => void;
};

type StageProps = {
  node: EvolutionNode;
  current: number;
  onSelect: (number: number) => void;
};

const EvolutionCard = ({ node, current, onSelect }: StageProps) => {
  const name = nameOf(node.number);
  const isCurrent = node.number === current;
  const types = getSpecies(node.number)?.types ?? [];

  return (
    <button
      type="button"
      aria-current={isCurrent ? 'true' : undefined}
      onClick={() => onSelect(node.number)}
      className="group flex w-20 flex-none flex-col items-center gap-1 rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <span
        className={cn(
          'flex items-center justify-center rounded-lg border border-transparent bg-muted/50 transition-colors group-hover:bg-muted motion-reduce:transition-none',
          isCurrent && SELECTED_TINT,
        )}
        style={{
          width: PLATE_SIZE,
          height: PLATE_SIZE,
          ...(isCurrent ? typeTintStyle(types) : undefined),
        }}
      >
        <PokemonImage number={node.number} name={name} size={SPRITE_SIZE} />
      </span>
      <span
        className={cn(
          'text-xs leading-tight',
          isCurrent ? 'font-semibold' : 'font-medium',
        )}
      >
        {name}
      </span>
      <span className="text-[11px] leading-none text-muted-foreground tabular-nums">
        #{String(node.number).padStart(4, '0')}
      </span>
    </button>
  );
};

const Connector = ({ evolution }: { evolution: Evolution }) => {
  const { primary, secondary } = evolutionTrigger(evolution);

  return (
    <div
      title={evolutionLabel(evolution)}
      className="grid w-24 flex-none grid-rows-[1fr_auto_1fr] px-1 text-center"
      style={{ height: PLATE_SIZE }}
    >
      <span className="self-end pb-0.5 text-[11px] leading-tight font-medium">
        {primary}
      </span>
      <span aria-hidden className="flex items-center text-muted-foreground">
        <span className="h-px flex-1 bg-current opacity-40" />
        <ChevronRight className="-ml-1 size-3.5 flex-none" />
      </span>
      <span className="pt-0.5 text-[10px] leading-tight text-muted-foreground">
        {secondary}
      </span>
    </div>
  );
};

const Stage = ({ node, current, onSelect }: StageProps) => {
  const { children } = node;

  return (
    <div className="flex items-start">
      <EvolutionCard node={node} current={current} onSelect={onSelect} />
      {children.length >= GRID_FROM && (
        <>
          <span
            aria-hidden
            className="flex flex-none items-center px-2 text-muted-foreground"
            style={{ height: PLATE_SIZE }}
          >
            <ChevronRight className="size-4" />
          </span>
          <ul className="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-4">
            {children.map((child) => {
              const trigger = child.evolution
                ? evolutionTrigger(child.evolution)
                : undefined;

              return (
                <li
                  key={child.number}
                  title={child.evolution && evolutionLabel(child.evolution)}
                  className="flex flex-col items-center gap-1.5"
                >
                  <EvolutionCard
                    node={child}
                    current={current}
                    onSelect={onSelect}
                  />
                  {trigger && (
                    <span className="flex max-w-24 flex-col items-center gap-0.5 text-center">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] leading-tight font-medium">
                        {trigger.primary}
                      </span>
                      {trigger.secondary && (
                        <span className="text-[10px] leading-tight text-muted-foreground">
                          {trigger.secondary}
                        </span>
                      )}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
      {children.length > 0 && children.length < GRID_FROM && (
        <div className="flex flex-col" style={{ gap: ROW_GAP }}>
          {children.map((child, index) => (
            <div key={child.number} className="relative flex items-start">
              {children.length > 1 && (
                <span
                  aria-hidden
                  className="absolute left-1 w-px bg-muted-foreground/40"
                  style={bracketStyle(index, children.length)}
                />
              )}
              {child.evolution && <Connector evolution={child.evolution} />}
              <Stage node={child} current={current} onSelect={onSelect} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const EvolutionLine = ({
  tree,
  current,
  onSelect,
}: EvolutionLineProps) => (
  <div className="overflow-x-auto pb-1">
    <Stage node={tree} current={current} onSelect={onSelect} />
  </div>
);
