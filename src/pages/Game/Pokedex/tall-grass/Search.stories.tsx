import type { Meta, StoryObj } from '@storybook/react-vite';

import { useThemeStyle } from '@/components/settings/themes';
import { pokedexFor } from '@/data/pokedex';

import { useStoryGameId } from '../../../../../.storybook/StoryGame';
import { pokedexStoryContext } from '../pokedexStoryData';
import { PokedexStorySurface } from '../PokedexStorySurface';
import { pokedexStoryViewFor } from '../pokedexStoryViews';
import { type PokedexFilterId, usePokedexSearch } from '../usePokedexSearch';

type SearchStoryProps = {
  gameId?: string;
  query: string;
  selected: Array<PokedexFilterId>;
};

const SearchContent = ({
  gameId,
  query,
  selected,
}: Required<SearchStoryProps>) => {
  const { game, region } = pokedexStoryContext(gameId);
  const style = useThemeStyle('pokedex');
  const { Search, surfaceClassName } = pokedexStoryViewFor(region, style);
  const entries = pokedexFor(region.versionGroup) ?? [];
  const search = usePokedexSearch(entries, game, { query, selected });

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-8">
      <PokedexStorySurface surfaceClassName={surfaceClassName}>
        <Search search={search} />
      </PokedexStorySurface>
    </div>
  );
};

const SearchStory = (props: SearchStoryProps) => {
  const selectedGameId = useStoryGameId();
  const gameId = props.gameId ?? selectedGameId;
  const { query, selected } = props;

  return (
    <SearchContent
      key={JSON.stringify([gameId, query, selected])}
      gameId={gameId}
      query={query}
      selected={selected}
    />
  );
};

const meta = {
  title: 'Pokédex/Search',
  component: SearchStory,
  argTypes: {
    gameId: { control: false },
    selected: {
      control: 'check',
      options: ['exclusive', 'trade', 'trade-only', 'obtainable', 'mega'],
    },
  },
  args: { query: '', selected: [] },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SearchStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithFilters: Story = {};

export const WithoutFilters: Story = {
  args: { gameId: 'legends-za' },
};

export const WithFiltersSelected: Story = {
  args: { selected: ['exclusive'] },
};

export const MegaEvolution: Story = {
  args: { gameId: 'legends-za', selected: ['mega'] },
};

export const WithQuery: Story = {
  args: { query: 'saur' },
};
