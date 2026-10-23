import type { ComponentType } from 'react';

import { createBrowserRouter, type LoaderFunctionArgs } from 'react-router';

import { PageSkeleton } from '@/components/PageSkeleton';
import { loadAllGameData, loadGameData } from '@/data/gameData';
import { getGame, regionIdsOf } from '@/data/games';
import { getRegion } from '@/data/maps';
import { HomePage } from '@/pages/Home/HomePage';
import { RootLayout } from '@/pages/RootLayout/RootLayout';
import { RouteErrorPage } from '@/pages/RouteError/RouteErrorPage';

const lazyPage = <Name extends string>(
  load: () => Promise<Record<Name, ComponentType>>,
  name: Name,
  loadData?: (args: LoaderFunctionArgs) => Promise<void>,
) => ({
  lazy: async () => ({
    Component: (await load())[name],
    loader:
      loadData &&
      (async (args: LoaderFunctionArgs) => {
        await loadData(args);

        return null;
      }),
  }),
});

const loadAll = () => loadAllGameData();

const loadGameOfRoute = ({ params }: LoaderFunctionArgs) => {
  const game = getGame(params.gameId);

  return loadGameData(
    ...(game ? regionIdsOf(game) : []).flatMap(
      (id) => getRegion(id)?.versionGroup ?? [],
    ),
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    HydrateFallback: PageSkeleton,
    children: [
      {
        errorElement: <RouteErrorPage />,
        children: [
          { index: true, element: <HomePage /> },
          {
            path: 'maps',
            ...lazyPage(() => import('@/pages/Maps/MapsPage'), 'MapsPage'),
          },
          {
            path: 'pokedex',
            ...lazyPage(
              () => import('@/pages/NationalPokedex/NationalPokedexPage'),
              'NationalPokedexPage',
              loadAll,
            ),
          },
          {
            path: 'data-lake',
            ...lazyPage(
              () => import('@/pages/DataLake/DataLakePage'),
              'DataLakePage',
              loadAll,
            ),
          },
          {
            path: 'changelog',
            ...lazyPage(
              () => import('@/pages/Changelog/ChangelogPage'),
              'ChangelogPage',
            ),
          },
          {
            path: 'credits',
            ...lazyPage(
              () => import('@/pages/Credits/CreditsPage'),
              'CreditsPage',
              loadAll,
            ),
          },
          ...(import.meta.env.DEV
            ? [
                {
                  path: 'pokemon-sprites',
                  ...lazyPage(
                    () => import('@/pages/PokemonSprites/PokemonSpritesPage'),
                    'PokemonSpritesPage',
                    loadAll,
                  ),
                },
                {
                  path: 'theme',
                  ...lazyPage(
                    () => import('@/pages/Theme/ThemePage'),
                    'ThemePage',
                    loadAll,
                  ),
                },
                {
                  path: 'maplibre',
                  ...lazyPage(
                    () => import('@/pages/MapLibreDev/MapLibreDevPage'),
                    'MapLibreDevPage',
                    loadAll,
                  ),
                },
                {
                  path: 'rby/map-maker',
                  ...lazyPage(
                    () => import('@/pages/MapMaker/RbyMapMakerPage'),
                    'RbyMapMakerPage',
                    loadAll,
                  ),
                },
                {
                  path: 'legends-za/map-maker',
                  ...lazyPage(
                    () => import('@/pages/MapMaker/MapMakerPage'),
                    'MapMakerPage',
                    loadAll,
                  ),
                },
              ]
            : []),
          {
            path: ':gameId',
            ...lazyPage(
              () => import('@/pages/Game/GameLayout'),
              'GameLayout',
              loadGameOfRoute,
            ),
            children: [
              {
                index: true,
                ...lazyPage(() => import('@/pages/Game/GamePage'), 'GamePage'),
              },
              {
                path: '*',
                ...lazyPage(() => import('@/pages/Game/GamePage'), 'GamePage'),
              },
            ],
          },
          {
            path: '*',
            ...lazyPage(
              () => import('@/pages/NotFound/NotFoundPage'),
              'NotFoundPage',
            ),
          },
        ],
      },
    ],
  },
]);
