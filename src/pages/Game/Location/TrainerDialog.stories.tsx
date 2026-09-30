import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { useStoryGameId } from '../../../../.storybook/StoryGame';

import { Button } from '@/components/ui/button';
import type { TrainerBattle } from '@/data/trainers/types';

import { pokedexStoryContext, storyEntries } from '../Pokedex/pokedexStoryData';
import { TrainerDialog } from './TrainerDialog';
import { findBattle } from './trainerStoryData';

type TrainerDialogStoryProps = {
  battle: TrainerBattle;
  label: string;
  place: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const TrainerDialogStory = ({
  battle,
  label,
  place,
  open,
  onOpenChange,
}: TrainerDialogStoryProps) => {
  const gameId = useStoryGameId();

  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <Button onClick={() => onOpenChange(true)}>Open trainer</Button>
      <TrainerDialog
        listed={open ? { battle, key: label, label } : undefined}
        place={place}
        game={pokedexStoryContext(gameId).game}
        pokedex={storyEntries(gameId, 151)}
        onClose={() => onOpenChange(false)}
      />
    </div>
  );
};

const meta = {
  title: 'Dialog/Trainer',
  component: TrainerDialogStory,
  parameters: { layout: 'fullscreen' },
  argTypes: { battle: { control: false } },
  render: function Render(args) {
    const [, updateArgs] = useArgs();

    return (
      <TrainerDialogStory
        {...args}
        onOpenChange={(open) => {
          args.onOpenChange(open);
          updateArgs({ open });
        }}
      />
    );
  },
  args: {
    onOpenChange: () => {},
    battle: findBattle('Beauty', 'celadon-city', 1),
    label: 'Beauty #1',
    place: 'Celadon City',
    open: true,
  },
} satisfies Meta<typeof TrainerDialogStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SinglePokemon: Story = {};

export const FullTeam: Story = {
  args: {
    battle: findBattle('Lance', 'indigo-plateau'),
    label: 'Lance',
    place: 'Indigo Plateau',
  },
};

export const AlternativeParties: Story = {
  args: {
    battle: findBattle('Rival', 'pallet-town'),
    label: 'Rival',
    place: 'Pallet Town',
  },
};

export const WithScroll: Story = {
  args: {
    battle: findBattle('Rival', 'indigo-plateau'),
    label: 'Rival',
    place: 'Indigo Plateau',
  },
};
