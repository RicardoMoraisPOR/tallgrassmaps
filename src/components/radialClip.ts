const COLUMNS = 20;
const STEPS = 44;

export const radialClipFrames = (width: number, height: number) => {
  const cell = width / COLUMNS;
  const rows = Math.ceil(height / cell);
  const centerX = width / 2;
  const centerY = height / 2;

  const phases = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: COLUMNS }, (_, column) => {
      const dx = (column + 0.5) * cell - centerX;
      const dy = centerY - (row + 0.5) * cell;
      const angle = (Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2);

      return (angle % Math.PI) / Math.PI;
    }),
  );

  const frames = ['path("M0 0")'];

  for (let step = 1; step < STEPS; step += 1) {
    const progress = step / STEPS;
    let shape = '';

    phases.forEach((rowPhases, row) => {
      const y = Math.floor(row * cell);
      const h = Math.ceil((row + 1) * cell) - y + 1;
      let runStart = -1;

      for (let column = 0; column <= COLUMNS; column += 1) {
        const revealed = column < COLUMNS && rowPhases[column] <= progress;

        if (revealed && runStart < 0) runStart = column;

        if (!revealed && runStart >= 0) {
          const x = Math.floor(runStart * cell);
          const w = Math.ceil(column * cell) - x + 1;

          shape += `M${x} ${y}h${w}v${h}h${-w}z`;
          runStart = -1;
        }
      }
    });

    frames.push(shape ? `path("${shape}")` : 'path("M0 0")');
  }

  frames.push(`path("M0 0h${width}v${height}h${-width}z")`);

  return frames;
};
