import type { Meta, StoryObj } from '@storybook/react-vite';

import type { PokedexData } from '@/data/pokedex/types';

import {
  rbyGameIdArgType,
  pokedexStoryContext,
  pokemonArgType,
  storyEntry,
} from '../pokedexStoryData';
import { withGameSurface } from '../withPokedexSurface';
import { RbyRow } from './RbyRow';

type RowStoryProps = {
  gameId: string;
  pokemon: number;
  expanded: boolean;
  overrides: Partial<PokedexData>;
};

const RowStory = ({ gameId, pokemon, expanded, overrides }: RowStoryProps) => {
  const entry = storyEntry(gameId, pokemon, overrides);

  if (!entry)
    return (
      <p className="text-sm text-muted-foreground">
        No Pokémon #{pokemon} in the master data.
      </p>
    );

  return (
    <ul className="flex flex-col">
      <RbyRow
        key={`${gameId}-${pokemon}-${expanded}`}
        {...pokedexStoryContext(gameId)}
        entry={entry}
        focused={expanded}
      />
    </ul>
  );
};

const meta = {
  title: 'Pokédex/RBY/Row',
  component: RowStory,
  decorators: [withGameSurface],
  argTypes: {
    gameId: rbyGameIdArgType,
    pokemon: pokemonArgType,
    overrides: { control: 'object' },
  },
  args: { gameId: 'red', pokemon: 25, expanded: false, overrides: {} },
} satisfies Meta<typeof RowStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Expanded: Story = {
  args: {
    expanded: true,
    overrides: {
      games: ['red', 'blue', 'yellow'],
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
    gameId: 'blue',
    pokemon: 23,
    expanded: true,
    overrides: { games: ['red'] },
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

export const GameCornerPrize: Story = {
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

export const Gen1Types: Story = {
  name: 'Gen 1 types',
  args: { pokemon: 35, overrides: { types: ['normal'] } },
};
