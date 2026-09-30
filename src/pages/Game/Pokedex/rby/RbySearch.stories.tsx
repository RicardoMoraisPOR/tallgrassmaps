import type { Meta, StoryObj } from '@storybook/react-vite';

import type { PokedexData } from '@/data/pokedex/types';

import {
  rbyGameIdArgType,
  pokedexStoryContext,
  storyEntries,
} from '../pokedexStoryData';
import { type PokedexFilterId, usePokedexSearch } from '../usePokedexSearch';
import { withGameSurface } from '../withPokedexSurface';
import { RbySearch } from './RbySearch';

const searchOverrides: Record<number, Partial<PokedexData>> = {
  23: { games: ['red'] },
  24: { games: ['red'] },
  27: { games: ['blue'] },
  28: { games: ['blue'] },
  122: {
    encounters: [
      {
        method: 'trade',
        path: 'route-2',
        tradeFor: 63,
        games: ['red', 'blue'],
      },
    ],
  },
  124: {
    encounters: [
      {
        method: 'trade',
        path: 'cerulean-city',
        tradeFor: 91,
        games: ['red', 'blue'],
      },
    ],
  },
};

type SearchStoryProps = {
  gameId: string;
  count: number;
  query: string;
  selected: Array<PokedexFilterId>;
};

const Search = ({ gameId, count, query, selected }: SearchStoryProps) => {
  const { game } = pokedexStoryContext(gameId);
  const search = usePokedexSearch(
    storyEntries(gameId, count, searchOverrides),
    game,
    { query, selected },
  );

  return <RbySearch search={search} />;
};

const SearchStory = (props: SearchStoryProps) => (
  <Search key={JSON.stringify(props)} {...props} />
);

const meta = {
  title: 'Pokédex/RBY/Search',
  component: SearchStory,
  decorators: [withGameSurface],
  argTypes: {
    selected: {
      control: 'check',
      options: ['exclusive', 'trade', 'obtainable'],
    },
    gameId: rbyGameIdArgType,
  },
  args: { gameId: 'red', count: 151, query: '', selected: [] },
} satisfies Meta<typeof SearchStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithFilters: Story = {};

export const WithFiltersSelected: Story = {
  args: { selected: ['exclusive'] },
};

export const WithQuery: Story = {
  args: { query: 'saur' },
};
