import type { Meta, StoryObj } from '@storybook/react-vite';

import { gameIdArgType, pokedexStoryContext } from '../pokedexStoryData';
import { withTallGrassSurface } from '../withPokedexSurface';
import { TallGrassTitle } from './TallGrassTitle';

const TitleStory = ({ gameId }: { gameId: string }) => {
  const { game, region } = pokedexStoryContext(gameId);

  return <TallGrassTitle game={game} region={region} />;
};

const meta = {
  title: 'Pokédex/Tall Grass/Title',
  component: TitleStory,
  decorators: [withTallGrassSurface],
  argTypes: { gameId: gameIdArgType },
  args: { gameId: 'red' },
} satisfies Meta<typeof TitleStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Red: Story = {};

export const LegendsZA: Story = {
  name: 'Legends: Z-A',
  args: { gameId: 'legends-za' },
};
