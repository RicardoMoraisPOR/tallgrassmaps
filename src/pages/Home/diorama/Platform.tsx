import {
  COLORS,
  GLOW,
  LAYER_GAP,
  PLATFORM_LAYERS,
  PLATFORM_SIZE,
} from './config';

const sideColor = (index: number) => {
  const ratio = index / (PLATFORM_LAYERS - 1);

  return `color-mix(in srgb, ${COLORS.mid} ${Math.round(ratio * 100)}%, ${COLORS.dark})`;
};

const checker = `conic-gradient(${COLORS.light} 25%, color-mix(in srgb, ${COLORS.light} 88%, ${COLORS.mid}) 0 50%, ${COLORS.light} 0 75%, color-mix(in srgb, ${COLORS.light} 88%, ${COLORS.mid}) 0)`;

const gridLine = 'rgb(108 196 106 / 0.16)';
const grid = `linear-gradient(${gridLine} 1px, transparent 1px), linear-gradient(90deg, ${gridLine} 1px, transparent 1px)`;

const TOP_INDEX = PLATFORM_LAYERS - 1;
const FLATTEN_DELAY_SECONDS = 0.55;

const FLATTEN_SECONDS = 0.95;
const GLOW_SECONDS = 0.9;

const flatten = (map: boolean) => {
  const delay = map ? FLATTEN_DELAY_SECONDS : 0;
  const glow = map
    ? `box-shadow ${GLOW_SECONDS}s ease ${FLATTEN_DELAY_SECONDS + FLATTEN_SECONDS * 0.85}s`
    : 'box-shadow 0.3s ease 0s';

  return `transform ${FLATTEN_SECONDS}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, opacity 0.7s ease ${delay}s, ${glow}`;
};

type PlatformProps = { animated: boolean; map: boolean };

export const Platform = ({ animated, map }: PlatformProps) => (
  <>
    {Array.from({ length: PLATFORM_LAYERS }, (_, index) => {
      const top = index === TOP_INDEX;

      return (
        <div
          key={index}
          aria-hidden
          className="absolute rounded-md motion-reduce:transition-none"
          style={{
            inset: top ? -5 : 0,
            ['--z' as string]: `${index * LAYER_GAP}px`,
            ['--i' as string]: index,
            transform:
              'translateZ(calc(var(--z) * var(--build, 1) + var(--i) * var(--sep, 0px)))',
            transition: flatten(map),
            opacity: map ? (top ? 0.3 : 0) : 1,
            animation: animated
              ? `diorama-rise 0.95s cubic-bezier(0.22, 1, 0.36, 1) ${0.3 + index * 0.008}s backwards`
              : undefined,
            background: top ? checker : sideColor(index),
            backgroundSize: top
              ? `${PLATFORM_SIZE / 4}px ${PLATFORM_SIZE / 4}px`
              : undefined,
            boxShadow: top
              ? map
                ? `0 0 30px 8px ${GLOW}, inset 0 0 0 3px ${COLORS.light}`
                : `0 0 0 0 rgb(108 196 106 / 0), inset 0 0 0 3px color-mix(in srgb, ${COLORS.light} 70%, white)`
              : undefined,
          }}
        />
      );
    })}
    <div
      aria-hidden
      className="pointer-events-none absolute rounded-md motion-reduce:transition-none"
      style={{
        inset: -5,
        transform: `translateZ(calc(${TOP_INDEX * LAYER_GAP}px * var(--build, 1) + ${PLATFORM_LAYERS} * var(--sep, 0px) + 1px))`,
        transition: flatten(map),
        opacity: map ? 1 : 0,
        backgroundImage: grid,
        backgroundSize: `${PLATFORM_SIZE / 8}px ${PLATFORM_SIZE / 8}px`,
        boxShadow: `inset 0 0 0 2px ${COLORS.light}`,
      }}
    />
  </>
);
