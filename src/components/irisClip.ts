const PINHOLE_RADIUS = 0.2;

export const irisClipAt = (width: number, height: number, progress: number) => {
  const x = width / 2;
  const y = height / 2;
  const reach = Math.hypot(x, y) + 4;
  const radius = reach + (PINHOLE_RADIUS - reach) * progress;

  return `path(evenodd, "M0 0h${width}v${height}h${-width}zM${x - radius} ${y}a${radius} ${radius} 0 1 0 ${radius * 2} 0a${radius} ${radius} 0 1 0 ${-radius * 2} 0z")`;
};
