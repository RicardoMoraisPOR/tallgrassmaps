import { isTouchDevice } from '@/lib/media';

import { Billboard } from './Billboard';
import { PLATFORM_SIZE, seeded } from './config';

const GRID = 9;
const TOUCH_GRID = 6;
const MARGIN = 34;
const JITTER = 9;
const HEIGHT_RATIO = 1.5;
const OUTLINE = '#2a6a3c';
const WAVE_SECONDS_PER_PIXEL = 0.0026;

const FRONT_GREENS = ['#6cc46a', '#5db75e', '#4aa557'];
const BACK_GREENS = ['#3f9150', '#36834a', '#2f7a42'];

type Blade = { base: number; tip: number; height: number; front: boolean };

const BLADES: Array<Blade> = [
  { base: 9, tip: 3, height: 34, front: false },
  { base: 39, tip: 45, height: 36, front: false },
  { base: 15, tip: 9, height: 46, front: true },
  { base: 33, tip: 39, height: 48, front: true },
  { base: 24, tip: 24, height: 58, front: true },
  { base: 20, tip: 17, height: 40, front: false },
  { base: 28, tip: 31, height: 42, front: false },
];

const bladePath = ({ base, tip, height }: Blade) =>
  `M${base - 5.5} 62C${base - 5.5} ${62 - height * 0.5} ${tip - 2} ${62 - height * 0.82} ${tip} ${62 - height}C${tip + 2} ${62 - height * 0.82} ${base + 5.5} ${62 - height * 0.5} ${base + 5.5} 62Z`;

type Clump = {
  x: number;
  y: number;
  width: number;
  flip: boolean;
  fills: Array<string>;
  delay: number;
  sway: number;
  swayDelay: number;
  blowX: number;
  blowY: number;
  blowRotate: number;
  leaveDelay: number;
  returnDelay: number;
};

const span = PLATFORM_SIZE - 2 * MARGIN;
const centre = PLATFORM_SIZE / 2;

const buildClumps = (grid: number): Array<Clump> => {
  const random = seeded(23);
  const pick = (colors: Array<string>) =>
    colors[Math.floor(random() * colors.length)];

  return Array.from({ length: grid * grid }, (_, index) => {
    const column = index % grid;
    const row = Math.floor(index / grid);
    const x =
      MARGIN + (column / (grid - 1)) * span + (random() - 0.5) * JITTER * 2;
    const y =
      MARGIN + (row / (grid - 1)) * span + (random() - 0.5) * JITTER * 2;

    return {
      x,
      y,
      width: 52 + random() * 14,
      flip: random() > 0.5,
      fills: BLADES.map((blade) =>
        blade.front ? pick(FRONT_GREENS) : pick(BACK_GREENS),
      ),
      delay: 1.15 + random() * 1.1,
      sway: 2.4 + random() * 2.2,
      swayDelay: -random() * 5,
      blowX: ((x - centre) / centre) * 150 + (random() - 0.5) * 60,
      blowY: -(90 + random() * 130),
      blowRotate: (random() - 0.5) * 150,
      leaveDelay:
        Math.hypot(x - centre, y - centre) * WAVE_SECONDS_PER_PIXEL +
        random() * 0.2,
      returnDelay: 0.25 + random() * 0.6,
    };
  });
};

const clumps = buildClumps(GRID);
const touchClumps = buildClumps(TOUCH_GRID);

type TallGrassProps = { animated: boolean; map: boolean };

export const TallGrass = ({ animated, map }: TallGrassProps) => (
  <>
    {(isTouchDevice() ? touchClumps : clumps).map((clump, index) => {
      const { x, y, width, flip, fills, delay, sway, swayDelay } = clump;

      return (
        <Billboard
          key={index}
          x={x}
          y={y}
          width={width}
          height={width * HEIGHT_RATIO}
        >
          <div
            className="size-full motion-reduce:transition-none"
            style={{
              transformOrigin: '50% 100%',
              animation: animated
                ? `diorama-pop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s backwards`
                : undefined,
              transform: map
                ? `translate(${clump.blowX}px, ${clump.blowY}px) rotate(${clump.blowRotate}deg) scale(0.15)`
                : 'none',
              opacity: map ? 0 : 1,
              visibility: map ? 'hidden' : 'visible',
              transition: map
                ? `transform 0.85s cubic-bezier(0.55, 0, 0.9, 0.5) ${clump.leaveDelay}s, opacity 0.55s ease-in ${clump.leaveDelay + 0.3}s, visibility 0s linear ${clump.leaveDelay + 0.9}s`
                : `transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${clump.returnDelay}s, opacity 0.3s ease-out ${clump.returnDelay}s, visibility 0s linear ${clump.returnDelay}s`,
            }}
          >
            <svg
              aria-hidden
              viewBox="0 0 48 62"
              preserveAspectRatio="none"
              className="size-full overflow-visible"
              style={{
                transform: flip ? 'scaleX(-1)' : undefined,
                ...(animated
                  ? {
                      transformOrigin: '50% 100%',
                      animation: `diorama-sway ${sway}s ease-in-out ${swayDelay}s infinite`,
                      animationPlayState: map ? 'paused' : 'running',
                    }
                  : undefined),
              }}
            >
              {BLADES.map((blade, bladeIndex) => (
                <path
                  key={bladeIndex}
                  d={bladePath(blade)}
                  fill={fills[bladeIndex]}
                  stroke={OUTLINE}
                  strokeWidth="0.9"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
          </div>
        </Billboard>
      );
    })}
  </>
);
