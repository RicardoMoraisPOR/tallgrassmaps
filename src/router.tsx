import { createBrowserRouter } from 'react-router';

import { ChangelogPage } from '@/pages/Changelog/ChangelogPage';
import { CreditsPage } from '@/pages/Credits/CreditsPage';
import { DataLakePage } from '@/pages/DataLake/DataLakePage';
import { GameLayout } from '@/pages/Game/GameLayout';
import { GamePage } from '@/pages/Game/GamePage';
import { HomePage } from '@/pages/Home/HomePage';
import { MapsPage } from '@/pages/Maps/MapsPage';
import { NationalPokedexPage } from '@/pages/NationalPokedex/NationalPokedexPage';
import { NotFoundPage } from '@/pages/NotFound/NotFoundPage';
import { RootLayout } from '@/pages/RootLayout/RootLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'maps', element: <MapsPage /> },
      { path: 'pokedex', element: <NationalPokedexPage /> },
      { path: 'data-lake', element: <DataLakePage /> },
      { path: 'changelog', element: <ChangelogPage /> },
      { path: 'credits', element: <CreditsPage /> },
      ...(import.meta.env.DEV
        ? [
            {
              path: 'pokemon-sprites',
              lazy: async () => ({
                Component: (
                  await import('@/pages/PokemonSprites/PokemonSpritesPage')
                ).PokemonSpritesPage,
              }),
            },
            {
              path: 'legends-za/map-maker',
              lazy: async () => ({
                Component: (await import('@/pages/MapMaker/MapMakerPage'))
                  .MapMakerPage,
              }),
            },
          ]
        : []),
      {
        path: ':gameId',
        element: <GameLayout />,
        children: [
          { index: true, element: <GamePage /> },
          { path: '*', element: <GamePage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
