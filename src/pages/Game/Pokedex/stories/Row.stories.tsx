import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { useThemeStyle } from '@/components/settings/themes';
import { gamesSharingMap } from '@/data/games';
import { pokedexFor } from '@/data/pokedex';
import type { PokedexData } from '@/data/pokedex/types';
import { cn } from '@/lib/utils';

import { useStoryGameId } from '../../../../../.storybook/StoryGame';
import { pokedexStoryContext, storyEntry } from './pokedexStoryData';
import { pokedexStoryViewFor } from './pokedexStoryViews';

type RowStoryProps = {
  pokemon: number;
  expanded: boolean;
  overrides: Partial<PokedexData>;
  versionExclusive?: boolean;
};

const RowStory = ({
  pokemon,
  expanded: initialExpanded,
  overrides,
  versionExclusive = false,
}: RowStoryProps) => {
  const gameId = useStoryGameId();
  const [expanded, setExpanded] = useState(initialExpanded);
  const { game, region, href } = pokedexStoryContext(gameId);
  const style = useThemeStyle('pokedex');
  const { Row, surfaceClassName, rowListClassName } = pokedexStoryViewFor(
    region,
    style,
  );
  const entries = pokedexFor(region.versionGroup) ?? [];
  const selectedOverrides = versionExclusive
    ? {
        ...overrides,
        games: gamesSharingMap(game)
          .filter(({ id }) => id !== gameId)
          .slice(0, 1)
          .map(({ id }) => id),
      }
    : overrides.encounters
      ? {
          ...overrides,
          encounters: overrides.encounters.map((encounter) => ({
            ...encounter,
            games: [gameId],
          })),
        }
      : overrides;
  const entry = storyEntry(gameId, pokemon, selectedOverrides);
  const names = new Map(entries.map(({ number, name }) => [number, name]));
  const nameOf = (number: number) =>
    names.get(number) ?? (number === entry?.number ? entry.name : `#${number}`);

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-8">
      <div
        className={cn(
          'w-md max-w-[calc(100vw-2rem)] rounded-xl border bg-popover p-4 text-sm text-popover-foreground',
          surfaceClassName,
        )}
        onClickCapture={(event) => {
          const target = event.target;

          if (target instanceof Element && target.closest('[aria-controls]'))
            setExpanded((current) => !current);
        }}
      >
        {entry && (
          <ul className={rowListClassName}>
            <Row
              game={game}
              region={region}
              href={href}
              nameOf={nameOf}
              entry={entry}
              key={`${gameId}-${pokemon}-${expanded}`}
              focused={expanded}
              selected={expanded}
            />
          </ul>
        )}
      </div>
    </div>
  );
};

const meta = {
  title: 'Pokédex/Row',
  component: RowStory,
  argTypes: {
    pokemon: { control: { type: 'number', min: 1, max: 1025 } },
    overrides: { control: 'object' },
  },
  args: { pokemon: 25, expanded: false, overrides: {} },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof RowStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Expanded: Story = {
  args: {
    expanded: true,
    overrides: {
      encounters: [
        {
          method: 'walk',
          path: 'route-2/viridian-forest',
          levels: [3, 5],
          chance: [5, 5],
          games: ['red'],
        },
        {
          method: 'walk',
          path: 'route-10/power-plant',
          levels: [20, 24],
          chance: [25, 25],
          games: ['red'],
        },
      ],
    },
  },
};

export const VersionExclusive: Story = {
  args: {
    pokemon: 23,
    expanded: true,
    overrides: {},
    versionExclusive: true,
  },
};

export const InGameTrade: Story = {
  args: {
    pokemon: 122,
    expanded: true,
    overrides: {
      encounters: [
        { method: 'trade', path: 'route-2', tradeFor: 63, games: ['red'] },
      ],
    },
  },
};

export const Prize: Story = {
  args: {
    pokemon: 137,
    expanded: true,
    overrides: {
      encounters: [
        {
          method: 'prize',
          path: 'celadon-city/rocket-game-corner',
          levels: [18, 18],
          games: ['red'],
        },
      ],
    },
  },
};

export const Evolution: Story = {
  args: {
    pokemon: 26,
    expanded: true,
    overrides: {
      evolvesFrom: { number: 25, method: 'item', item: 'Thunder Stone' },
    },
  },
};
