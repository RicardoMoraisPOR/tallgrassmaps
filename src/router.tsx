import { createBrowserRouter } from 'react-router';

import GameLayout from '@/pages/Game/GameLayout';
import RegionPage from '@/pages/Game/Region/RegionPage';
import HomePage from '@/pages/Home/HomePage';
import NotFoundPage from '@/pages/NotFound/NotFoundPage';
import RootLayout from '@/pages/RootLayout/RootLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: ':gameId',
        element: <GameLayout />,
        children: [
          { index: true, element: <RegionPage /> },
          {
            path: '*',
            lazy: async () => ({
              Component: (await import('@/pages/Game/Location/LocationPage'))
                .default,
            }),
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
