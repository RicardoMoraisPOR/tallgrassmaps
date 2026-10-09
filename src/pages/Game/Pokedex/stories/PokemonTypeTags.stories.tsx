import type { Meta, StoryObj } from '@storybook/react-vite';

import { useThemeStyle } from '@/components/settings/themes';
import { getSpecies } from '@/data/pokedex/master';

import { useStoryGameId } from '../../../../../.storybook/StoryGame';
import {
  allTypes,
  pokedexStoryContext,
  pokemonArgType,
} from './pokedexStoryData';
import { PokedexStorySurface } from './PokedexStorySurface';
import { pokedexStoryViewFor } from './pokedexStoryViews';

type TypeTagsStoryProps = {
  pokemon: number;
  allTypes?: boolean;
};

const TypeTagsStory = ({
  pokemon,
  allTypes: showAll = false,
}: TypeTagsStoryProps) => {
  const gameId = useStoryGameId();
  const { region } = pokedexStoryContext(gameId);
  const style = useThemeStyle('pokedex');
  const { TypeTags, surfaceClassName } = pokedexStoryViewFor(region, style);
  const types = showAll ? allTypes : (getSpecies(pokemon)?.types ?? []);

  return (
    <PokedexStorySurface surfaceClassName={surfaceClassName}>
      <TypeTags types={types} />
    </PokedexStorySurface>
  );
};

const meta = {
  title: 'Pokédex/Type tags',
  component: TypeTagsStory,
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
  args: { allTypes: true },
};
