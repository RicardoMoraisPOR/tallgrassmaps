import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { useThemeStyle } from '@/components/settings/themes';
import { Button } from '@/components/ui/button';

import { useStoryGameId } from '../../../../../.storybook/StoryGame';
import { pokedexStoryContext } from '../pokedexStoryData';
import { pokedexStoryViewFor } from '../pokedexStoryViews';

const DrawerStory = () => {
  const gameId = useStoryGameId();
  const { game, region } = pokedexStoryContext(gameId);
  const [open, setOpen] = useState(true);
  const style = useThemeStyle('pokedex');
  const { Drawer, Title } = pokedexStoryViewFor(region, style);

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-8">
      {!open && <Button onClick={() => setOpen(true)}>Open Pokédex</Button>}
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        header={<Title game={game} region={region} />}
      >
        <p className="p-4">Pokédex content</p>
      </Drawer>
    </div>
  );
};

const meta = {
  title: 'Pokédex/Drawer',
  component: DrawerStory,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof DrawerStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Preview: Story = {};
