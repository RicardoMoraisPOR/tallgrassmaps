import type { MapLink } from '@/components/map/viewer/types';
import type { LocationFloor } from '@/data/maps';

const GAP_PIXELS = 56;
const ROOF_LEVEL = 1000;

export type StackedFloor = {
  id: string;
  name: string;
  image: string;
  pixelated: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
};

const level = (name: string) => {
  const basement = /^B(\d+)F$/.exec(name);
  const upper = /^(\d+)F$/.exec(name);

  if (basement) return -Number(basement[1]);
  if (upper) return Number(upper[1]);
  if (name === 'Roof') return ROOF_LEVEL;

  return 0;
};

export const stackOrder = (floors: Array<LocationFloor>) =>
  floors.toSorted((a, b) => level(b.name) - level(a.name));

type Side = 'left' | 'right' | 'above' | 'below';

export type FloorLayout = {
  grid: Array<Array<string | undefined>>;
  attach?: Array<{ floor: string; side: Side; of: string }>;
};

const asGrid = (
  rows: Array<Array<string | undefined>>,
  attach: FloorLayout['attach'] = [],
): FloorLayout => ({ grid: rows, attach });

export const floorLayouts: Record<string, FloorLayout> = {
  'ss-anne': asGrid(
    [
      ['3F', undefined],
      ['2F', '2F Cabins'],
      ['1F', '1F Cabins'],
      ['B1F', 'B1F Cabins'],
      ['Dock', undefined],
    ],
    [
      { floor: 'Bow', side: 'left', of: '3F' },
      { floor: "Captain's Room", side: 'right', of: '3F' },
      { floor: 'Kitchen', side: 'left', of: '1F' },
    ],
  ),
  'rocket-game-corner': asGrid([
    ['Game Corner', undefined],
    ['B1F', 'Elevator'],
    ['B2F', undefined],
    ['B3F', undefined],
    ['B4F', undefined],
  ]),
  'celadon-mansion': asGrid([
    ['Roof House', 'Roof'],
    [undefined, '3F'],
    [undefined, '2F'],
    [undefined, '1F'],
  ]),
  'celadon-dept-store': asGrid([
    [undefined, 'Roof'],
    [undefined, '5F'],
    [undefined, '4F'],
    [undefined, '3F'],
    [undefined, '2F'],
    ['Elevator', '1F'],
  ]),
  'silph-co': asGrid([
    ['11F', undefined],
    ['10F', undefined],
    ['9F', undefined],
    ['8F', undefined],
    ['7F', undefined],
    ['6F', undefined],
    ['5F', undefined],
    ['4F', undefined],
    ['3F', undefined],
    ['2F', undefined],
    ['1F', 'Elevator'],
  ]),
  'safari-zone': asGrid(
    [
      [undefined, undefined, 'North', undefined, undefined],
      ['West Rest House', 'West', 'Center', 'East', 'East Rest House'],
      [undefined, undefined, 'Center Rest House', undefined, undefined],
    ],
    [
      { floor: 'Secret House', side: 'left', of: 'North' },
      { floor: 'North Rest House', side: 'right', of: 'North' },
    ],
  ),
  'cinnabar-lab': asGrid(
    [['Meeting Room', 'R&D Room', 'Testing Room']],
    [{ floor: 'Lobby', side: 'below', of: 'R&D Room' }],
  ),
  'pokemon-league': asGrid([
    ['Hall of Fame'],
    ["Champion's Room"],
    ["Lance's Room"],
    ["Agatha's Room"],
    ["Bruno's Room"],
    ["Lorelei's Room"],
  ]),
};

const place = (
  floor: LocationFloor,
  imageOf: (floor: LocationFloor) => string,
  x: number,
  y: number,
): StackedFloor => ({
  id: floor.id,
  name: floor.name,
  image: imageOf(floor),
  pixelated: floor.pixelated,
  x,
  y,
  width: floor.width,
  height: floor.height,
});

const gridLayout = (
  floors: Array<LocationFloor>,
  imageOf: (floor: LocationFloor) => string,
  { grid, attach = [] }: FloorLayout,
) => {
  const byName = new Map(floors.map((floor) => [floor.name, floor]));
  const used = new Set([
    ...grid.flat().filter((name) => name !== undefined),
    ...attach.map(({ floor }) => floor),
  ]);
  const rows: Array<Array<LocationFloor | undefined>> = [
    ...grid.map((row) =>
      row.map((name) => (name ? byName.get(name) : undefined)),
    ),
    ...floors.filter((floor) => !used.has(floor.name)).map((floor) => [floor]),
  ];
  const columns = Math.max(...rows.map((row) => row.length));
  const columnWidths = Array.from({ length: columns }, (_, column) =>
    Math.max(0, ...rows.map((row) => row[column]?.width ?? 0)),
  );
  const rowHeights = rows.map((row) =>
    Math.max(0, ...row.map((floor) => floor?.height ?? 0)),
  );

  for (const { floor: name, side, of } of attach) {
    const neighbour = byName.get(name);
    const rowIndex = rows.findIndex((row) =>
      row.some((floor) => floor?.name === of),
    );

    if (neighbour && rowIndex >= 0 && (side === 'left' || side === 'right'))
      rowHeights[rowIndex] = Math.max(rowHeights[rowIndex], neighbour.height);
  }
  const columnX = columnWidths.map((_, column) =>
    columnWidths
      .slice(0, column)
      .reduce((sum, width) => sum + width + GAP_PIXELS, 0),
  );
  const rowY = rowHeights.map((_, row) =>
    rowHeights
      .slice(0, row)
      .reduce((sum, height) => sum + height + GAP_PIXELS, 0),
  );

  const placed = rows.flatMap((row, rowIndex) =>
    row.flatMap((floor, column) =>
      floor
        ? [
            place(
              floor,
              imageOf,
              columnX[column] + (columnWidths[column] - floor.width) / 2,
              rowY[rowIndex] + (rowHeights[rowIndex] - floor.height) / 2,
            ),
          ]
        : [],
    ),
  );

  for (const { floor: name, side, of } of attach) {
    const floor = byName.get(name);
    const anchor = placed.find((entry) => entry.name === of);

    if (!floor || !anchor) continue;

    const centeredX = anchor.x + (anchor.width - floor.width) / 2;
    const centeredY = anchor.y + (anchor.height - floor.height) / 2;
    const position = {
      left: [anchor.x - GAP_PIXELS - floor.width, centeredY],
      right: [anchor.x + anchor.width + GAP_PIXELS, centeredY],
      above: [centeredX, anchor.y - GAP_PIXELS - floor.height],
      below: [centeredX, anchor.y + anchor.height + GAP_PIXELS],
    }[side];

    placed.push(place(floor, imageOf, position[0], position[1]));
  }

  const left = Math.min(...placed.map((entry) => entry.x));
  const top = Math.min(...placed.map((entry) => entry.y));
  const shifted = placed.map((entry) => ({
    ...entry,
    x: entry.x - left,
    y: entry.y - top,
  }));

  return {
    floors: shifted,
    width: Math.max(...shifted.map((entry) => entry.x + entry.width)),
    height: Math.max(...shifted.map((entry) => entry.y + entry.height)),
  };
};

export const stackFloors = (
  floors: Array<LocationFloor>,
  imageOf: (floor: LocationFloor) => string,
  layout?: FloorLayout,
) => {
  if (layout) return gridLayout(floors, imageOf, layout);

  const ordered = stackOrder(floors);
  const width = Math.max(...ordered.map((floor) => floor.width));
  let top = 0;

  const placed = ordered.map((floor) => {
    const entry = place(floor, imageOf, (width - floor.width) / 2, top);

    top += floor.height + GAP_PIXELS;

    return entry;
  });

  return { floors: placed, width, height: top - GAP_PIXELS };
};

export const offsetLink = <T extends MapLink>(
  link: T,
  dx: number,
  dy: number,
): T => ({
  ...link,
  x: link.x + dx,
  y: link.y + dy,
  outline: link.outline?.map((polygon) =>
    polygon.map(([x, y]): [number, number] => [x + dx, y + dy]),
  ),
  ...(link.area && { area: offsetLink(link.area, dx, dy) }),
});

export const stackedHref = (href: string | undefined) =>
  href && !href.includes('floors=')
    ? `${href}${href.includes('?') ? '&' : '?'}floors=all`
    : href;
