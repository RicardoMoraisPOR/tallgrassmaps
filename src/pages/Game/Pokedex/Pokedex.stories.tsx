import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { generations } from '@/data/catalog';
import { formatList } from '@/lib/utils';

import { ColorDot } from '../ColorDot';
import { Pokedex } from './Pokedex';
import { pokedexGameIds, pokedexStoryContext } from './pokedexStoryData';
import { usePokedexLink } from './usePokedex';

const pokedexGenerations = generations
  .map((generation) => ({
    ...generation,
    gameIds: generation.entries
      .map(({ game }) => game.id)
      .filter((id) => pokedexGameIds.includes(id)),
  }))
  .filter(({ gameIds }) => gameIds.length > 0)
  .map((generation) => ({
    ...generation,
    regions: [
      ...new Set(
        generation.gameIds.map((id) => pokedexStoryContext(id).region.name),
      ),
    ],
  }));

const PokedexGames = () => {
  const [gameId, setGameId] = useState(pokedexGameIds[0]);
  const link = usePokedexLink();
  const { game, region, href } = pokedexStoryContext(gameId);

  return (
    <div className="flex min-h-svh flex-col gap-10 bg-background p-8">
      {pokedexGenerations.map((generation) => (
        <section key={generation.number} className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold tracking-tight whitespace-nowrap">
              Generation {generation.roman}{' '}
              <span className="font-normal text-muted-foreground">
                · {formatList(generation.regions)}
              </span>
            </h2>
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="flex flex-wrap gap-2">
            {generation.gameIds.map((id) => {
              const { game: option } = pokedexStoryContext(id);

              return (
                <Button
                  key={id}
                  asChild
                  variant={id === gameId ? 'default' : 'outline'}
                >
                  <Link {...link} onClick={() => setGameId(id)}>
                    <ColorDot color={option.colors[0]} />
                    {option.shortName} Pokédex
                  </Link>
                </Button>
              );
            })}
          </div>
        </section>
      ))}
      <Pokedex key={gameId} game={game} region={region} href={href} />
    </div>
  );
};

const meta = {
  title: 'Pokédex/Full Pokédex',
  component: PokedexGames,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PokedexGames>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Games: Story = {};
