import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  gameIdArgType,
  pokedexStoryContext,
  storyEntries,
} from '../pokedexStoryData';
import { withTallGrassSurface } from '../withPokedexSurface';
import { TallGrassList } from './TallGrassList';

const ListStory = ({ gameId, count }: { gameId: string; count: number }) => (
  <TallGrassList
    {...pokedexStoryContext(gameId)}
    entries={storyEntries(gameId, count)}
  />
);

const meta = {
  title: 'Pokédex/Tall Grass/List',
  component: ListStory,
  decorators: [withTallGrassSurface],
  argTypes: {
    gameId: gameIdArgType,
    count: { control: { type: 'range', min: 0, max: 1025 } },
  },
  args: { gameId: 'red', count: 151 },
} satisfies Meta<typeof ListStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllPokemon: Story = {
  args: { count: 1025 },
};

export const NoResults: Story = {
  args: { count: 0 },
};
