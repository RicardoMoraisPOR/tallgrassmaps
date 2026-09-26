import { Container } from '@/components/Container';
import { PageTransition } from '@/components/PageTransition';
import { useGameRoute } from '@/hooks/useGameRoute';
import { NotFoundPage } from '@/pages/NotFound/NotFoundPage';

import { PageHeader } from './PageHeader';

export const GameLayout = () => {
  const route = useGameRoute();

  if (!route) {
    return <NotFoundPage />;
  }

  return (
    <Container
      as="section"
      className="flex flex-1 flex-col gap-7 pt-6 pb-10 sm:pt-10 sm:pb-16"
    >
      <PageHeader
        game={route.game}
        region={route.region}
        trail={route.trail ?? []}
        href={route.href}
      />
      <div className="flex flex-1 flex-col overflow-clip">
        <PageTransition mapMotion />
      </div>
    </Container>
  );
};
