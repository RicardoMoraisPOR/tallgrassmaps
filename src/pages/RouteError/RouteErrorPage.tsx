import { Link, useRouteError } from 'react-router';

import { Container } from '@/components/Container';
import { PageTitle } from '@/components/PageTitle';
import { Button } from '@/components/ui/button';

export const RouteErrorPage = () => {
  const error = useRouteError();
  const detail = error instanceof Error ? error.message : undefined;

  return (
    <Container
      as="section"
      className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center"
    >
      <p className="font-mono text-sm text-muted-foreground">Error</p>
      <PageTitle>A wild bug appeared</PageTitle>
      <p className="max-w-prose text-muted-foreground">
        Something went wrong while loading this page. Reload to try again.
      </p>
      {detail && (
        <p className="max-w-prose font-mono text-xs text-muted-foreground">
          {detail}
        </p>
      )}
      <div className="flex gap-2">
        <Button onClick={() => window.location.reload()}>Reload</Button>
        <Button variant="outline" asChild>
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    </Container>
  );
};
