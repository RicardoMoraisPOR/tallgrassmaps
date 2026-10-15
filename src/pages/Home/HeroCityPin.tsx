import { m } from 'motion/react';

import { cn } from '@/lib/utils';

import type { CityMap, HeroCity } from './heroCities';

const HOLD_SECONDS = 3.4;
const FADE_IN_SHARE = 0.14;
const FADE_OUT_SHARE = 0.84;
const GRID_CELL_PIXELS = 24;
const GRID_RADIUS_PIXELS = 105;
const MAP_WIDTH_PIXELS = 230;
const MAP_OPACITY = 0.2;
const LABEL_CHARACTER_PIXELS = 8.4;
const LABEL_EDGE_PIXELS = 12;

export type CityPin = {
  id: number;
  name: string;
  map?: CityMap;
  x: number;
  y: number;
  labelShift: number;
};

export const createCityPin = (
  id: number,
  city: HeroCity,
  point: { x: number; y: number },
  containerWidth: number,
): CityPin => {
  const halfLabel = (city.name.length * LABEL_CHARACTER_PIXELS) / 2;
  const center = Math.min(
    Math.max(point.x, halfLabel + LABEL_EDGE_PIXELS),
    containerWidth - halfLabel - LABEL_EDGE_PIXELS,
  );

  return {
    id,
    name: city.name,
    map: city.map,
    x: point.x,
    y: point.y,
    labelShift: center - point.x,
  };
};

type HeroCityPinProps = {
  pin: CityPin;
  onDone: (id: number) => void;
};

const PIN_VIEWBOX = '5 8 22 20';
const PIN_WIDTH_PIXELS = 34;
const PIN_HEIGHT_PIXELS = (PIN_WIDTH_PIXELS * 20) / 22;
const PIN_TIP_X = 0.5;
const PIN_TIP_Y = 0.55;
const TILE_SECONDS = 0.3;
const FALL_DELAY_SECONDS = 0.2;
const FALL_SECONDS = 0.75;
const LANDING_SHARE = 0.55;
const LANDING_SECONDS = FALL_DELAY_SECONDS + FALL_SECONDS * LANDING_SHARE;
const FALL_HEIGHT_PIXELS = 46;
const LOGO_LIGHT = '#6cc46a';
const LOGO_MID = '#3f9150';
const LOGO_DARK = '#1f5130';

export const HeroCityPin = ({ pin, onDone }: HeroCityPinProps) => {
  const svgStyle = {
    left: -PIN_WIDTH_PIXELS * PIN_TIP_X,
    top: -PIN_HEIGHT_PIXELS * PIN_TIP_Y,
    width: PIN_WIDTH_PIXELS,
    height: PIN_HEIGHT_PIXELS,
  };

  return (
    <m.div
      className="absolute"
      style={{ left: pin.x, top: pin.y }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{
        duration: HOLD_SECONDS,
        times: [0, 0.04, FADE_OUT_SHARE, 1],
        ease: 'easeOut',
      }}
      onAnimationComplete={() => onDone(pin.id)}
    >
      <m.span
        aria-hidden
        className="absolute top-0 left-0 size-8 -translate-1/2 rounded-full border border-brand"
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: [0.3, 1.6], opacity: [0.35, 0] }}
        transition={{
          duration: 1.4,
          delay: LANDING_SECONDS,
          ease: 'easeOut',
        }}
      />
      <m.svg
        aria-hidden
        viewBox={PIN_VIEWBOX}
        className="absolute overflow-visible"
        style={{ ...svgStyle, transformOrigin: '50% 55%' }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: TILE_SECONDS, ease: [0.16, 1, 0.3, 1] }}
      >
        <path d="M16 13.5L26 18.5L16 23.5L6 18.5Z" fill={LOGO_LIGHT} />
        <path
          d="M6 18.5V21.5L16 26.5V23.5Z M26 18.5V21.5L16 26.5V23.5Z"
          fill={LOGO_LIGHT}
          opacity="0.55"
        />
        <ellipse cx="16" cy="19.2" rx="2.4" ry="1.2" fill={LOGO_MID} />
      </m.svg>
      <m.svg
        aria-hidden
        viewBox={PIN_VIEWBOX}
        className="absolute overflow-visible"
        style={svgStyle}
        initial={{ y: -FALL_HEIGHT_PIXELS, opacity: 0 }}
        animate={{
          y: [-FALL_HEIGHT_PIXELS, 0, -5, 0],
          opacity: [0, 1, 1, 1],
        }}
        transition={{
          duration: FALL_SECONDS,
          delay: FALL_DELAY_SECONDS,
          times: [0, LANDING_SHARE, 0.78, 1],
          ease: ['easeIn', 'easeOut', 'easeIn'],
        }}
      >
        <path
          d="M16 19C16 19 12.76 15.04 12.76 12.7A3.24 3.24 0 0 1 19.24 12.7C19.24 15.04 16 19 16 19Z"
          fill={LOGO_LIGHT}
          stroke={LOGO_DARK}
          strokeWidth="1.2"
          strokeLinejoin="round"
          paintOrder="stroke"
        />
        <circle cx="16" cy="12.7" r="1.22" fill={LOGO_DARK} />
      </m.svg>
      <m.span
        className="absolute bottom-6 left-0 -translate-x-1/2 text-[11px] leading-none font-medium tracking-[0.14em] whitespace-nowrap text-foreground uppercase"
        style={{ marginLeft: pin.labelShift }}
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: 0.7,
          delay: LANDING_SECONDS,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {pin.name}
      </m.span>
    </m.div>
  );
};

export const HeroCityGrid = ({ pin }: { pin: CityPin }) => {
  const left = pin.x - GRID_RADIUS_PIXELS;
  const top = pin.y - GRID_RADIUS_PIXELS;
  const offsetX =
    ((-left % GRID_CELL_PIXELS) + GRID_CELL_PIXELS) % GRID_CELL_PIXELS;
  const offsetY =
    ((-top % GRID_CELL_PIXELS) + GRID_CELL_PIXELS) % GRID_CELL_PIXELS;

  return (
    <m.div
      aria-hidden
      className="absolute"
      style={{
        left,
        top,
        width: GRID_RADIUS_PIXELS * 2,
        height: GRID_RADIUS_PIXELS * 2,
        backgroundImage:
          'linear-gradient(color-mix(in oklab, var(--foreground) 16%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--foreground) 16%, transparent) 1px, transparent 1px)',
        backgroundSize: `${GRID_CELL_PIXELS}px ${GRID_CELL_PIXELS}px`,
        backgroundPosition: `${offsetX}px ${offsetY}px`,
        maskImage: 'radial-gradient(circle, black 0%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(circle, black 0%, transparent 70%)',
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1, 1, 1] }}
      transition={{
        duration: HOLD_SECONDS,
        times: [0, 0.2, FADE_OUT_SHARE, 1],
        ease: 'easeOut',
      }}
    />
  );
};

export const HeroCityMap = ({ pin }: { pin: CityPin }) => {
  const { map } = pin;

  if (!map) return null;

  const width = MAP_WIDTH_PIXELS;
  const height = (width * map.height) / map.width;
  const mask = 'radial-gradient(ellipse at center, black 25%, transparent 72%)';

  return (
    <m.img
      aria-hidden
      alt=""
      src={map.image}
      draggable={false}
      className={cn(
        'absolute max-w-none grayscale select-none dark:invert',
        map.pixelated && 'pixelated',
      )}
      style={{
        left: pin.x - width / 2,
        top: pin.y - height / 2,
        width,
        height,
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, MAP_OPACITY, MAP_OPACITY, 0] }}
      transition={{
        duration: HOLD_SECONDS,
        times: [0, FADE_IN_SHARE, FADE_OUT_SHARE, 1],
        ease: 'easeOut',
      }}
    />
  );
};
