const COLUMNS = 20;
const TILES_PER_STEP = 5;

type Cell = { column: number; row: number };

const spiralOrder = (columns: number, rows: number) => {
  const cells: Array<Cell> = [];
  let top = 0;
  let bottom = rows - 1;
  let left = 0;
  let right = columns - 1;

  while (top <= bottom && left <= right) {
    for (let column = left; column <= right; column += 1) {
      cells.push({ column, row: top });
    }

    for (let row = top + 1; row <= bottom; row += 1) {
      cells.push({ column: right, row });
    }

    if (top < bottom) {
      for (let column = right - 1; column >= left; column -= 1) {
        cells.push({ column, row: bottom });
      }
    }

    if (left < right) {
      for (let row = bottom - 1; row > top; row -= 1) {
        cells.push({ column: left, row });
      }
    }

    top += 1;
    bottom -= 1;
    left += 1;
    right -= 1;
  }

  return cells;
};

export const spiralClipFrames = (width: number, height: number) => {
  const cell = width / COLUMNS;
  const rows = Math.ceil(height / cell);
  const order = spiralOrder(COLUMNS, rows);
  const frames = ['path("M0 0")'];
  let shape = '';

  order.forEach(({ column, row }, index) => {
    const x = Math.floor(column * cell);
    const y = Math.floor(row * cell);
    const w = Math.ceil((column + 1) * cell) - x + 1;
    const h = Math.ceil((row + 1) * cell) - y + 1;

    shape += `M${x} ${y}h${w}v${h}h${-w}z`;

    if ((index + 1) % TILES_PER_STEP === 0 || index === order.length - 1) {
      frames.push(`path("${shape}")`);
    }
  });

  return frames;
};
