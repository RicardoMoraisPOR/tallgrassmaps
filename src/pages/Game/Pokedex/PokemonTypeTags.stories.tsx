import type { Meta, StoryObj } from '@storybook/react-vite';

import { getSpecies } from '@/data/pokedex/master';

import { allTypes, pokemonArgType } from './pokedexStoryData';
import { PokemonTypeTags } from './PokemonTypeTags';
import { withStyleSurface } from './withPokedexSurface';

const TypeTagsStory = ({ pokemon }: { pokemon: number }) => (
  <PokemonTypeTags types={getSpecies(pokemon)?.types ?? []} />
);

const meta = {
  title: 'Pokédex/Shared/Type tags',
  component: TypeTagsStory,
  decorators: [withStyleSurface],
  argTypes: { pokemon: pokemonArgType },
  args: { pokemon: 25 },
} satisfies Meta<typeof TypeTagsStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SingleType: Story = {};

export const DualType: Story = {
  args: { pokemon: 1 },
};

export const AllTypes: Story = {
  render: () => <PokemonTypeTags types={allTypes} />,
};
