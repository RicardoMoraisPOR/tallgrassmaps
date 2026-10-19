const bitmaps = {
  leaf: ['X..X..X', 'XX.X.XX', 'XX.X.XX', 'XXXXXXX', '.XXXXX.', '..XXX..'],
  cavern: [
    '...X...',
    '..XXX..',
    '..XXX..',
    '.XXXXX.',
    '.XXXXX.',
    'XXXXXXX',
    'XXXXXXX',
  ],
  indoors: [
    'XXXXXXX',
    'X.X.X.X',
    'XXXXXXX',
    'X.X.X.X',
    'XXXXXXX',
    'XXX.XXX',
    'XXX.XXX',
  ],
  water: ['XX..XX.', '..XX..X', '.......', 'XX..XX.', '..XX..X'],
  rod: [
    '......X',
    '.....XX',
    '....X.X',
    '...X..X',
    '..X...X',
    'XX....X',
    'XX...XX',
  ],
  store: [
    'XXXXXXX',
    'X.X.X.X',
    'XXXXXXX',
    'X.....X',
    'X.XXX.X',
    'X.X.X.X',
    'XXXXXXX',
  ],
  sign: [
    'XXXXXXX',
    'XXXXXXX',
    'XXXXXXX',
    '...X...',
    '...X...',
    '...X...',
    '...X...',
  ],
  gift: [
    '.XX.XX.',
    'X..X..X',
    '.XXXXX.',
    'XXXXXXX',
    'X.XXX.X',
    'X.XXX.X',
    'XXXXXXX',
  ],
  static: [
    '...X...',
    '...X...',
    '..XXX..',
    'XXXXXXX',
    '..XXX..',
    '...X...',
    '...X...',
  ],
};

export type PixelIconName = keyof typeof bitmaps;

const pathOf = (rows: Array<string>) =>
  rows
    .flatMap((row, y) =>
      [...row.matchAll(/X+/g)].map(
        ({ 0: run, index }) => `M${index} ${y}h${run.length}v1h-${run.length}z`,
      ),
    )
    .join('');

export const PixelIcon = ({
  name,
  className = 'size-4',
}: {
  name: PixelIconName;
  className?: string;
}) => {
  const rows = bitmaps[name];

  return (
    <svg
      viewBox={`0 0 7 ${rows.length}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={className}
    >
      <path fill="currentColor" d={pathOf(rows)} />
    </svg>
  );
};
