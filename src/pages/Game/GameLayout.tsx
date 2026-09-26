import Container from '@/components/Container';
import PageTransition from '@/components/PageTransition';
import { useGameRoute } from '@/hooks/useGameRoute';
import { gameHref, trailPath } from '@/lib/paths';
import NotFoundPage from '@/pages/NotFound/NotFoundPage';

import PageHeader from './PageHeader';

export default function GameLayout() {
  const route = useGameRoute();

  if (!route) {
    return <NotFoundPage />;
  }

  const { game, region, href } = route;
  const trail = route.trail ?? [];
  const title = trail.at(-1)?.name ?? region.name;
  const ancestors =
    trail.length > 0
      ? [
          { name: region.name, href: gameHref(game.id) },
          ...trail.slice(0, -1).map((step, index) => ({
            name: step.name,
            href: href(trailPath(trail.slice(0, index + 1))),
          })),
        ]
      : [];

  return (
    <Container
      as="section"
      className="flex flex-1 flex-col gap-7 pt-6 pb-10 sm:pt-10 sm:pb-16"
    >
      <PageHeader game={game} ancestors={ancestors} title={title} />
      <PageTransition mapMotion />
    </Container>
  );
}
