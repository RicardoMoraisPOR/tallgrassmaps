import { Link } from 'react-router';

import { Container } from '@/components/Container';
import { PageTitle } from '@/components/PageTitle';
import { Button } from '@/components/ui/button';

export const NotFoundPage = () => {
  return (
    <Container
      as="section"
      className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center"
    >
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <PageTitle>Nothing in this patch of grass</PageTitle>
      <p className="max-w-prose text-muted-foreground">
        This page doesn&apos;t exist. The link might be old, or the place
        isn&apos;t mapped yet.
      </p>
      <Button asChild>
        <Link to="/">Back to home</Link>
      </Button>
    </Container>
  );
};
