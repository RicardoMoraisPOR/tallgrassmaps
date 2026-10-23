export type MapView = { x: number; y: number; zoom: number };

const SEED_TTL_MS = 1500;

let seeded: { view: MapView; at: number } | undefined;

export const seedView = (view: MapView) => {
  seeded = { view, at: Date.now() };
};

export const takePendingView = () =>
  seeded && Date.now() - seeded.at < SEED_TTL_MS ? seeded.view : undefined;
