import type { Meta, StoryObj } from '@storybook/react-vite';

import type { TrainerBattle } from '@/data/trainers/types';

import { pokedexStoryContext, storyEntries } from '../Pokedex/pokedexStoryData';
import { findBattle } from './trainerStoryData';
import { TrainerTooltip } from './TrainerTooltip';

type TrainerTooltipStoryProps = {
  battle: TrainerBattle;
  number?: number;
};

const TrainerTooltipStory = ({ battle, number }: TrainerTooltipStoryProps) => (
  <TrainerTooltip
    listed={{ battle, key: battle.name, label: battle.name, number }}
    game={pokedexStoryContext('red').game}
    pokedex={storyEntries('red', 151)}
  />
);

const meta = {
  title: 'Location/Trainer tooltip',
  component: TrainerTooltipStory,
  decorators: [
    (Story) => (
      <div className="p-10">
        <Story />
      </div>
    ),
  ],
  argTypes: { battle: { control: false } },
  args: {
    battle: findBattle('Youngster', 'route-3'),
    number: 1,
  },
} satisfies Meta<typeof TrainerTooltipStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TwoPokemon: Story = {};

export const SinglePokemon: Story = {
  args: { battle: findBattle('Beauty', 'celadon-city', 1), number: undefined },
};

export const FullTeam: Story = {
  args: { battle: findBattle('Lance', 'indigo-plateau'), number: undefined },
};

export const AlternativeParties: Story = {
  args: { battle: findBattle('Rival', 'pallet-town'), number: undefined },
};
