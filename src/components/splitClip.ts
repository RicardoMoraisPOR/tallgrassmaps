const splitFrame = (width: number, height: number, gap: number) => {
  const half = height / 2;
  const length = half - gap + 0.5;

  return `path("M0 0h${width}v${length}h${-width}zM0 ${half + gap - 0.5}h${width}v${length}h${-width}z")`;
};

export const splitClipFrames = (width: number, height: number) => [
  splitFrame(width, height, 0),
  splitFrame(width, height, height / 2),
];
