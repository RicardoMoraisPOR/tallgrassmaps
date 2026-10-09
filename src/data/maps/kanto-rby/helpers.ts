import renderedFiles from '../kanto-rby-rendered.json';
import type { MapSource, MapVariant, Rect } from '../types';

export const IMAGE_DIR = '/maps/rby';

const vgmaps: MapSource = {
  name: 'VGMaps',
  url: 'https://www.vgmaps.com/Atlas/GB-GBC/',
  credit: 'RyuMaster',
  note: 'Towns, routes and dungeons, with the people and items taken out',
};

const pret: MapSource = {
  name: 'pret/pokered and pret/pokeyellow',
  url: 'https://github.com/pret/pokered',
  credit: 'the pret team',
  note: "Buildings and other interiors, drawn by us from the games' own map and tile data. Yellow versions only where they differ from Red and Blue.",
};

const rendered = new Set<string>(renderedFiles);

export const sourceFor = (file: string) => (rendered.has(file) ? pret : vgmaps);

export type Size = [width: number, height: number];

export const entrance = (x: number, y: number): Rect => ({
  x: x - 4,
  y: y - 4,
  width: 24,
  height: 24,
});

export const rect = (
  x: number,
  y: number,
  width: number,
  height: number,
): Rect => ({
  x,
  y,
  width,
  height,
});

export const warp = (x: number, y: number): Rect => entrance(x * 16, y * 16);

export const variant = (game: string, file: string): MapVariant => ({
  games: [game],
  image: `${IMAGE_DIR}/variants/${game}/${file}`,
  source: sourceFor(`variants/${game}/${file}`),
});
