export type Game = {
  id: string;
  name: string;
  generation: number;
  region: string;
  colors: string[];
};

export const games: Game[] = [
  {
    id: 'red',
    name: 'Pokémon Red',
    generation: 1,
    region: 'kanto-rby',
    colors: ['oklch(0.58 0.2 27)'],
  },
  {
    id: 'blue',
    name: 'Pokémon Blue',
    generation: 1,
    region: 'kanto-rby',
    colors: ['oklch(0.5 0.17 262)'],
  },
  {
    id: 'yellow',
    name: 'Pokémon Yellow',
    generation: 1,
    region: 'kanto-rby',
    colors: ['oklch(0.86 0.16 92)'],
  },
];

export const getGame = (id: string | undefined) =>
  games.find((game) => game.id === id);
