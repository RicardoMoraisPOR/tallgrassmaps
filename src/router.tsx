import { createBrowserRouter } from 'react-router';

import { CreditsPage } from '@/pages/Credits/CreditsPage';
import { GameLayout } from '@/pages/Game/GameLayout';
import { GamePage } from '@/pages/Game/GamePage';
import { HomePage } from '@/pages/Home/HomePage';
import { NotFoundPage } from '@/pages/NotFound/NotFoundPage';
import { RootLayout } from '@/pages/RootLayout/RootLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'credits', element: <CreditsPage /> },
      ...(import.meta.env.DEV
        ? [
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
