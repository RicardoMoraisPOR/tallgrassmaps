import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  rbyGameIdArgType,
  pokedexStoryContext,
  storyEntries,
} from '../pokedexStoryData';
import { withGameSurface } from '../withPokedexSurface';
import { RbyList } from './RbyList';

const ListStory = ({ gameId, count }: { gameId: string; count: number }) => (
  <RbyList
    {...pokedexStoryContext(gameId)}
    entries={storyEntries(gameId, count)}
  />
);

const meta = {
  title: 'Pokédex/RBY/List',
  component: ListStory,
  decorators: [withGameSurface],
  argTypes: {
    gameId: rbyGameIdArgType,
    count: { control: { type: 'range', min: 0, max: 1025 } },
  },
  args: { gameId: 'red', count: 151 },
} satisfies Meta<typeof ListStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Red: Story = {};

export const AllPokemon: Story = {
  args: { count: 1025 },
};

export const NoResults: Story = {
  args: { count: 0 },
};
