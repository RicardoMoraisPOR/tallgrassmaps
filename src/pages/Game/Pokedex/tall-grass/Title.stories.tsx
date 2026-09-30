import type { Meta, StoryObj } from '@storybook/react-vite';

import { useThemeStyle } from '@/components/settings/themes';

import { useStoryGameId } from '../../../../../.storybook/StoryGame';
import { pokedexStoryContext } from '../pokedexStoryData';
import { PokedexStorySurface } from '../PokedexStorySurface';
import { pokedexStoryViewFor } from '../pokedexStoryViews';

const TitleStory = () => {
  const gameId = useStoryGameId();
  const { game, region } = pokedexStoryContext(gameId);
  const style = useThemeStyle('pokedex');
  const { Title, gameTheme } = pokedexStoryViewFor(region, style);

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-8">
      <PokedexStorySurface gameTheme={gameTheme}>
        <Title game={game} region={region} />
      </PokedexStorySurface>
    </div>
  );
};

const meta = {
  title: 'Pokédex/Title',
  component: TitleStory,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TitleStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Preview: Story = {};
