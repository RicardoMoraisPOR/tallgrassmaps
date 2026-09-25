import { Button } from '@/components/ui/button';
import { useTrackerStore } from '@/stores/tracker';

export default function HomePage() {
  const itemCount = useTrackerStore((state) => Object.keys(state.items).length);
  const secretCount = useTrackerStore(
    (state) => Object.keys(state.secrets).length,
  );
  const reset = useTrackerStore((state) => state.reset);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
        Tall Grass
      </h1>
      <p className="max-w-prose text-muted-foreground">
        An interactive map companion: encounters, day and night, items and
        secrets.
      </p>
      <p className="text-sm text-muted-foreground">
        {itemCount} items and {secretCount} secrets collected
      </p>
      <Button
        variant="outline"
        onClick={reset}
        disabled={itemCount + secretCount === 0}
      >
        Reset progress
      </Button>
    </section>
  );
}
