import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';

import { Button } from '@/components/ui/button';

import { pokedexStoryContext } from '../pokedexStoryData';
import { TallGrassDrawer } from './TallGrassDrawer';
import { TallGrassTitle } from './TallGrassTitle';

const { game, region } = pokedexStoryContext('red');

const meta = {
  title: 'Pokédex/Tall Grass/Drawer',
  component: TallGrassDrawer,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    header: { control: false },
    children: { control: false },
  },
  args: {
    open: true,
    onClose: () => {},
    header: <TallGrassTitle game={game} region={region} />,
    children: (
      <ul className="flex flex-col gap-2">
        {Array.from({ length: 30 }, (_, index) => (
          <li key={index} className="border px-3 py-2">
            Content {index + 1}
          </li>
        ))}
      </ul>
    ),
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs();

    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <Button onClick={() => updateArgs({ open: true })}>Open drawer</Button>
        <TallGrassDrawer
          {...args}
          onClose={() => {
            args.onClose();
            updateArgs({ open: false });
          }}
        />
      </div>
    );
  },
} satisfies Meta<typeof TallGrassDrawer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {};

export const Closed: Story = {
  args: { open: false },
};
