const SAMPLE_STEPS = 8;

export const cubicBezier = (x1: number, y1: number, x2: number, y2: number) => {
  const at = (t: number, a: number, b: number) =>
    3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3;
  const slope = (t: number, a: number, b: number) =>
    3 * (1 - t) ** 2 * a + 6 * (1 - t) * t * (b - a) + 3 * t ** 2 * (1 - b);

  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;

    let t = x;

    for (let step = 0; step < SAMPLE_STEPS; step += 1) {
      const error = at(t, x1, x2) - x;
      const derivative = slope(t, x1, x2);

      if (Math.abs(error) < 1e-5 || derivative === 0) break;

      t -= error / derivative;
    }

    return at(Math.min(1, Math.max(0, t)), y1, y2);
  };
};
