import type { Meta, StoryObj } from '@storybook/react-vite';

import { useStoryGameId } from '../../../../../.storybook/StoryGame';
import { Pokedex } from '../Pokedex';
import { pokedexStoryContext } from './pokedexStoryData';

const PokedexStory = () => {
  const gameId = useStoryGameId();
  const { game, region, href } = pokedexStoryContext(gameId);

  return (
    <div className="flex min-h-svh flex-col gap-10 bg-background p-8">
      <Pokedex key={gameId} game={game} region={region} href={href} />
    </div>
  );
};

const meta = {
  title: 'Pokédex',
  component: PokedexStory,
  parameters: { layout: 'fullscreen', route: '/?pokedex' },
} satisfies Meta<typeof PokedexStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FullPokedex: Story = {};
