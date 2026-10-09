import type { Meta, StoryObj } from '@storybook/react-vite';

import { useThemeStyle } from '@/components/settings/themes';
import { pokedexFor } from '@/data/pokedex';

import { useStoryGameId } from '../../../../../.storybook/StoryGame';
import { pokedexStoryContext } from './pokedexStoryData';
import { PokedexStorySurface } from './PokedexStorySurface';
import { pokedexStoryViewFor } from './pokedexStoryViews';

const ListStory = ({ empty = false }: { empty?: boolean }) => {
  const gameId = useStoryGameId();
  const { game, region, href } = pokedexStoryContext(gameId);
  const style = useThemeStyle('pokedex');
  const { List, surfaceClassName } = pokedexStoryViewFor(region, style);
  const entries = empty
    ? []
    : (pokedexFor(region.versionGroup) ?? []).slice(0, 30);
  const names = new Map(entries.map((entry) => [entry.number, entry.name]));
  const nameOf = (number: number) => names.get(number) ?? `#${number}`;

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-8">
      <PokedexStorySurface surfaceClassName={surfaceClassName}>
        <List
          game={game}
          region={region}
          href={href}
          nameOf={nameOf}
          entries={entries}
        />
      </PokedexStorySurface>
    </div>
  );
};

const meta = {
  title: 'Pokédex/List',
  component: ListStory,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ListStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const First30: Story = {};

export const Empty: Story = {
  args: { empty: true },
};
