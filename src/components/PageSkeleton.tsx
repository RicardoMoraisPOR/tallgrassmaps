export const PageSkeleton = () => {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex flex-1 animate-pulse flex-col gap-4 p-4 motion-reduce:animate-none"
    >
      <div className="h-14 w-full max-w-sm rounded-lg bg-muted" />
      <div className="min-h-0 flex-1 rounded-lg bg-muted" />
    </div>
  );
};
