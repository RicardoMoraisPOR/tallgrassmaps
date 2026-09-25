import { Link } from 'react-router';

import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="font-heading text-3xl font-bold tracking-tight">
        Nothing in this patch of grass
      </h1>
      <p className="max-w-prose text-muted-foreground">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Button asChild>
        <Link to="/">Back to home</Link>
      </Button>
    </section>
  );
}
