import type { Game } from '@/data/games';
import { getRegion } from '@/data/maps';
import type { PokedexEntry } from '@/data/pokedex/types';
import { signsFor } from '@/data/signs';
import { gameSprite, pokemonSprite } from '@/data/sprites';

export const SLOTS = 6;
export const MIN_LEVEL = 1;
export const MAX_LEVEL = 100;
export const SHARE_PARAM = 'hof';

export type Member = { number: number; level: number };

export type Team = Array<Member | null>;

export const hasHallOfFame = (game: Game) => {
  const versionGroup = getRegion(game.region)?.versionGroup;

  return Boolean(
    versionGroup &&
    signsFor(versionGroup)?.some(
      ({ opens, games }) => opens === 'hall-of-fame' && games.includes(game.id),
    ),
  );
};

export const emptyTeam = (): Team => Array.from({ length: SLOTS }, () => null);

export const clampLevel = (level: number) =>
  Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, Math.round(level) || MIN_LEVEL));

export const encodeTeam = (team: Team) =>
  team
    .map((member) => (member ? `${member.number}-${member.level}` : '0'))
    .join('.');

export const decodeTeam = (
  value: string | null,
  pokedex: Array<PokedexEntry>,
): Team | undefined => {
  if (!value) return undefined;

  const slots = value.split('.');

  if (slots.length !== SLOTS) return undefined;

  const team = slots.map((slot): Member | null => {
    const [number, level] = slot.split('-').map(Number);

    return pokedex.some((entry) => entry.number === number)
      ? { number, level: clampLevel(level) }
      : null;
  });

  return team.some(Boolean) ? team : undefined;
};

const SCALE = 2;
const ROWS = Math.ceil(SLOTS / 2);

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

const createCanvas = (width: number, height: number, background: string) => {
  const canvas = document.createElement('canvas');

  canvas.width = width * SCALE;
  canvas.height = height * SCALE;

  const context = canvas.getContext('2d');

  if (!context) throw new Error('Canvas is not supported');

  context.scale(SCALE, SCALE);
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);
  context.textBaseline = 'top';

  return { canvas, context };
};

const drawSprite = (
  context: CanvasRenderingContext2D,
  sprite: HTMLImageElement | undefined,
  x: number,
  y: number,
  size: number,
) => {
  if (!sprite) return;

  const fit = Math.min(size / sprite.width, size / sprite.height);
  const width = sprite.width * fit;
  const height = sprite.height * fit;

  context.drawImage(
    sprite,
    x + (size - width) / 2,
    y + (size - height) / 2,
    width,
    height,
  );
};

const toBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Export failed'))),
      'image/png',
    ),
  );

type Placed = { member: Member; entry: PokedexEntry; slot: number };

const placeMembers = (team: Team, pokedex: Array<PokedexEntry>) =>
  team
    .filter((member): member is Member => member !== null)
    .flatMap((member) => {
      const entry = pokedex.find(({ number }) => number === member.number);

      return entry ? [{ member, entry }] : [];
    })
    .map((placed, slot): Placed => ({ ...placed, slot }));

const GAME = {
  ink: '#292929',
  screen: '#f6f4f7',
  font: '"Press Start 2P"',
  box: { width: 144, height: 128 },
  sprite: 80,
  columnGap: 24,
  rowGap: 32,
  padding: 32,
  bar: 44,
};

const GAME_SLOT_WIDTH = GAME.box.width + 8 + GAME.sprite;

const CORNER = ['..##..', '.####.', '######', '######', '.####.', '..##..'];

const drawGameFrame = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) => {
  context.fillStyle = GAME.ink;
  context.fillRect(x, y, width, height);
  context.fillStyle = GAME.screen;
  context.fillRect(x + 4, y + 4, width - 8, height - 8);
  context.fillStyle = GAME.ink;
  context.fillRect(x + 7, y + 7, width - 14, height - 14);
  context.fillStyle = GAME.screen;
  context.fillRect(x + 9, y + 9, width - 18, height - 18);

  const corners = [
    [x - 8, y - 8],
    [x + width - 4, y - 8],
    [x - 8, y + height - 4],
    [x + width - 4, y + height - 4],
  ];

  for (const [left, top] of corners) {
    CORNER.forEach((row, rowIndex) =>
      [...row].forEach((pixel, column) => {
        if (pixel !== '#') return;

        const inner =
          rowIndex >= 2 && rowIndex <= 3 && column >= 2 && column <= 3;

        context.fillStyle = inner ? GAME.screen : GAME.ink;
        context.fillRect(left + column * 2, top + rowIndex * 2, 2, 2);
      }),
    );
  }
};

const renderGameImage = async (
  placed: Array<Placed>,
  sprites: Array<HTMLImageElement | undefined>,
) => {
  await document.fonts.load(`8px ${GAME.font}`);

  const width = GAME.padding * 2 + GAME_SLOT_WIDTH * 2 + GAME.columnGap;
  const height =
    GAME.padding * 2 + ROWS * GAME.box.height + ROWS * GAME.rowGap + GAME.bar;
  const { canvas, context } = createCanvas(width, height, GAME.screen);

  context.imageSmoothingEnabled = false;

  const text = (value: string, x: number, y: number, size = 8) => {
    context.font = `${size}px ${GAME.font}`;
    context.fillStyle = GAME.ink;
    context.fillText(value.toUpperCase(), x, y);
  };

  for (const { member, entry, slot } of placed) {
    const x = GAME.padding + (slot % 2) * (GAME_SLOT_WIDTH + GAME.columnGap);
    const y =
      GAME.padding + Math.floor(slot / 2) * (GAME.box.height + GAME.rowGap);
    const [type1, type2] = entry.types;

    drawGameFrame(context, x, y, GAME.box.width, GAME.box.height);

    type Line = [value: string, indent: number, size?: number];

    const typeLines = (label: string, type: string | undefined): Array<Line> =>
      type
        ? [
            [label, 8],
            [type, 16],
          ]
        : [];
    const level = String(member.level);
    const lines: Array<Line> = [
      [entry.name, 0, 9],
      ['Level/', 8],
      [level, GAME.box.width - 30 - 8 * level.length],
      ...typeLines('Type1/', type1),
      ...typeLines('Type2/', type2),
    ];

    lines.forEach(([value, indent, size], index) =>
      text(value, x + 15 + indent, y + 16 + index * 14, size),
    );
    drawSprite(
      context,
      sprites[slot],
      x + GAME.box.width + 8,
      y + (GAME.box.height - GAME.sprite) / 2,
      GAME.sprite,
    );
  }

  const barY = height - GAME.padding - GAME.bar;

  drawGameFrame(
    context,
    GAME.padding,
    barY,
    width - GAME.padding * 2,
    GAME.bar,
  );
  text('Hall of Fame', GAME.padding + 16, barY + 17, 10);

  return toBlob(canvas);
};

export const renderTeamImage = async (
  team: Team,
  game: Game,
  pokedex: Array<PokedexEntry>,
) => {
  const placed = placeMembers(team, pokedex);
  const sprites = await Promise.all(
    placed.map(({ member }) =>
      loadImage(
        gameSprite(member.number, game) ?? pokemonSprite(member.number),
      ).catch(() => undefined),
    ),
  );

  return renderGameImage(placed, sprites);
};
