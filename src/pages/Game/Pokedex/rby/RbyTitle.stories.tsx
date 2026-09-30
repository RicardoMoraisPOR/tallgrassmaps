import type { Meta, StoryObj } from '@storybook/react-vite';

import { rbyGameIdArgType, pokedexStoryContext } from '../pokedexStoryData';
import { withGameSurface } from '../withPokedexSurface';
import { RbyTitle } from './RbyTitle';

const TitleStory = ({ gameId }: { gameId: string }) => {
  const { game, region } = pokedexStoryContext(gameId);

  return <RbyTitle game={game} region={region} />;
};

const meta = {
  title: 'Pokédex/RBY/Title',
  component: TitleStory,
  decorators: [withGameSurface],
  argTypes: { gameId: rbyGameIdArgType },
  args: { gameId: 'red' },
} satisfies Meta<typeof TitleStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Red: Story = {};

export const Blue: Story = {
  args: { gameId: 'blue' },
};

export const Yellow: Story = {
  args: { gameId: 'yellow' },
};
