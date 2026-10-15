import connectionData from '@/data/maps/kanto-rby-connections.json';

export type WorldDirection = 'north' | 'south' | 'east' | 'west';

export type WorldConnection = {
  to: string;
  direction: WorldDirection;
  area: { x: number; y: number; width: number; height: number };
};

export type WorldTile = { id: string; width: number; height: number };

export type WorldPlacement = Record<string, { x: number; y: number }>;

export const worldConnections = connectionData as Record<
  string,
  Array<WorldConnection>
>;

const ROOT = 'pallet-town';

const DETACHED_GAP_PIXELS = 160;

export const autoLayout = (tiles: Array<WorldTile>): WorldPlacement => {
  const sizes = new Map(tiles.map((tile) => [tile.id, tile]));
  const placement: WorldPlacement = {};

  const expand = (root: string) => {
    const queue = [root];

    while (queue.length > 0) {
      const id = queue.shift()!;
      const here = sizes.get(id);
      const origin = placement[id];

      if (!here) continue;

      for (const { to, direction, area } of worldConnections[id] ?? []) {
        const there = sizes.get(to);

        if (!there || placement[to]) continue;

        const back = worldConnections[to]?.find(
          (entry) => entry.to === id,
        )?.area;
        const alongX =
          area.x +
          area.width / 2 -
          (back ? back.x + back.width / 2 : there.width / 2);
        const alongY =
          area.y +
          area.height / 2 -
          (back ? back.y + back.height / 2 : there.height / 2);

        placement[to] = {
          east: { x: origin.x + here.width, y: origin.y + alongY },
          west: { x: origin.x - there.width, y: origin.y + alongY },
          north: { x: origin.x + alongX, y: origin.y - there.height },
          south: { x: origin.x + alongX, y: origin.y + here.height },
        }[direction];

        queue.push(to);
      }
    }
  };

  placement[ROOT] = { x: 0, y: 0 };
  expand(ROOT);

  for (const tile of tiles) {
    if (placement[tile.id]) continue;

    const left = Math.min(...Object.values(placement).map(({ x }) => x));

    placement[tile.id] = {
      x: left - tile.width - DETACHED_GAP_PIXELS,
      y: 0,
    };
    expand(tile.id);
  }

  return placement;
};

export const normalized = (placement: WorldPlacement): WorldPlacement => {
  const entries = Object.entries(placement);
  const left = Math.min(...entries.map(([, { x }]) => x));
  const top = Math.min(...entries.map(([, { y }]) => y));

  return Object.fromEntries(
    entries
      .toSorted(([a], [b]) => a.localeCompare(b))
      .map(([id, { x, y }]) => [id, { x: x - left, y: y - top }]),
  );
};
