type Point = [number, number];

type Ring = Array<Point>;

const signedArea = (ring: Ring) =>
  ring.reduce((sum, [x, y], index) => {
    const [nextX, nextY] = ring[(index + 1) % ring.length];

    return sum + (x * nextY - nextX * y);
  }, 0) / 2;

const contains = (ring: Ring, [x, y]: Point) =>
  ring.reduce((inside, [fromX, fromY], index) => {
    const [toX, toY] = ring[(index + 1) % ring.length];
    const crosses =
      fromY > y !== toY > y &&
      x < ((toX - fromX) * (y - fromY)) / (toY - fromY) + fromX;

    return crosses ? !inside : inside;
  }, false);

const edgeMidpoint = ([first, second = first]: Ring): Point => [
  (first[0] + second[0]) / 2,
  (first[1] + second[1]) / 2,
];

export const polygonsOf = (rings: Array<Ring>): Array<Array<Ring>> => {
  const outers = rings.filter((ring) => signedArea(ring) >= 0);
  const holes = rings.filter((ring) => signedArea(ring) < 0);
  const polygons = outers.map((outer) => [outer]);

  holes.forEach((hole) => {
    const midpoint = edgeMidpoint(hole);
    const owner = polygons
      .filter(([outer]) => contains(outer, midpoint))
      .toSorted(([a], [b]) => signedArea(a) - signedArea(b))[0];

    if (owner) owner.push(hole);
    else polygons.push([hole]);
  });

  return polygons;
};
