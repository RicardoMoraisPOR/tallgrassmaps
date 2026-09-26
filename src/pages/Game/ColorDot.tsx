export const ColorDot = ({ color }: { color: string }) => {
  return (
    <span
      aria-hidden
      className="size-2 flex-none rounded-full"
      style={{ background: color }}
    />
  );
};
