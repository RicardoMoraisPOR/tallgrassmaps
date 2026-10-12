import { cubicBezier } from './cubicBezier';
import { irisClipAt } from './irisClip';
import { radialClipFrames } from './radialClip';
import { spiralClipFrames } from './spiralClip';
import { splitClipFrames } from './splitClip';

const STRIP_COUNT = 5;
const BAR_DELAY_SHARE = 0.3;
const BAR_DELAYS = [0, 0.2, 0.27, 0.1, 0.3];
const BALL_OVERLAP = 0.5;
const COVER_MS = 900;
const HOLD_MS = 100;
const SPLIT_MS = 900;
const IRIS_APPROACH_END = 0.3;
const IRIS_HOLD_END = 0.8;
const IRIS_APPROACH_PROGRESS = 0.8;
const IRIS_EFFECT_START = 0.3;
const IRIS_ZOOM = 1.3;
const IRIS_BLUR_PX = 14;
const IRIS_EASING = 'cubic-bezier(0.45, 0, 0.4, 1)';
const irisCloseEasing = cubicBezier(0.2, 0.7, 0.3, 1);
const irisFinishEasing = cubicBezier(0.55, 0, 0.45, 1);
const COVER_COLOR = '#000';
const SPLIT_EASING = 'cubic-bezier(0.65, 0, 0.35, 1)';
const OVERLAY_Z_INDEX = '2147483000';

const POKEBALL = `<svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
  <circle cx="50" cy="50" r="47" fill="#f5f5f5" stroke="#111" stroke-width="6"/>
  <path d="M3 50a47 47 0 0 1 94 0z" fill="#e5393a" stroke="#111" stroke-width="6" stroke-linejoin="round"/>
  <path d="M3 50h94" stroke="#111" stroke-width="8"/>
  <circle cx="50" cy="50" r="14" fill="#f5f5f5" stroke="#111" stroke-width="6"/>
  <circle cx="50" cy="50" r="6" fill="#d9d9d9" stroke="#111" stroke-width="2"/>
</svg>`;

type Variant = 'bars' | 'spiral' | 'radial' | 'iris';

type EncounterOptions = {
  swap: () => void;
};

const variants: Array<Variant> = ['bars', 'spiral', 'radial', 'iris'];
let nextVariant = 0;

const pickVariant = () => {
  const variant = variants[nextVariant % variants.length];

  nextVariant += 1;

  return variant;
};

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const createOverlay = (initialClip: string) => {
  const overlay = document.createElement('div');
  const cover = document.createElement('div');

  overlay.setAttribute('aria-hidden', 'true');
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    zIndex: OVERLAY_Z_INDEX,
    overflow: 'hidden',
    pointerEvents: 'none',
  });
  Object.assign(cover.style, {
    position: 'absolute',
    inset: '0',
    background: COVER_COLOR,
    clipPath: initialClip,
  });
  overlay.append(cover);

  return { overlay, cover };
};

const createStrip = (
  index: number,
  width: number,
  barHeight: number,
  size: number,
) => {
  const fromLeft = index % 2 === 1;
  const wrapper = document.createElement('div');
  const bar = document.createElement('div');
  const ball = document.createElement('div');
  const barEdge = fromLeft ? width + size : -size;
  const ballLeft = fromLeft
    ? barEdge - size * BALL_OVERLAP
    : barEdge + size * BALL_OVERLAP - size;
  const start = fromLeft ? -(width + size * 2) : width + size * 2;

  ball.innerHTML = POKEBALL;
  Object.assign(wrapper.style, {
    position: 'absolute',
    left: '0',
    top: `${index * barHeight}px`,
    width: '100%',
    height: `${barHeight + 1}px`,
    transform: `translateX(${start}px)`,
  });
  Object.assign(bar.style, {
    position: 'absolute',
    top: '0',
    left: fromLeft ? '0' : `${-size}px`,
    width: `${width + size}px`,
    height: '100%',
    background: COVER_COLOR,
  });
  Object.assign(ball.style, {
    position: 'absolute',
    top: '0',
    left: `${ballLeft}px`,
    width: `${size}px`,
    height: `${size}px`,
  });
  wrapper.append(bar, ball);

  return { wrapper, ball, start, fromLeft };
};

const play = (
  element: HTMLElement,
  keyframes: PropertyIndexedKeyframes | Array<Keyframe>,
  duration: number,
  easing = 'linear',
) =>
  element.animate(keyframes, { duration, easing, fill: 'forwards' }).finished;

const playClipVariant = async (
  cover: Array<string>,
  width: number,
  height: number,
  swap: () => void,
) => {
  const { overlay, cover: layer } = createOverlay(cover[0]);

  document.body.append(overlay);

  try {
    await play(layer, { clipPath: cover }, COVER_MS);
    swap();
    await wait(HOLD_MS);
    await play(
      layer,
      { clipPath: splitClipFrames(width, height) },
      SPLIT_MS,
      SPLIT_EASING,
    );
  } finally {
    overlay.remove();
  }
};

const FULL_COVER = (width: number, height: number) =>
  `path("M0 0h${width}v${height}h${-width}zM0 0h0v0h0z")`;

const playBars = async (width: number, height: number, swap: () => void) => {
  const barHeight = Math.ceil(height / STRIP_COUNT);
  const size = barHeight;
  const { overlay, cover } = createOverlay('path("M0 0")');
  const strips = Array.from({ length: STRIP_COUNT }, (_, index) =>
    createStrip(index, width, barHeight, size),
  );
  const duration = COVER_MS * (1 - BAR_DELAY_SHARE);

  overlay.append(...strips.map(({ wrapper }) => wrapper));
  document.body.append(overlay);

  try {
    await Promise.all(
      strips.flatMap(({ wrapper, ball, start, fromLeft }, index) => {
        const timing = {
          duration,
          delay: BAR_DELAYS[index] * COVER_MS,
          easing: 'linear',
          fill: 'both',
        } as const;
        const distance = Math.abs(start);
        const turns = (distance / (Math.PI * size)) * 360 * (fromLeft ? 1 : -1);

        return [
          wrapper.animate(
            [{ transform: `translateX(${start}px)` }, { transform: 'none' }],
            timing,
          ).finished,
          ball.animate(
            [
              { transform: 'rotate(0deg)' },
              { transform: `rotate(${turns}deg)` },
            ],
            timing,
          ).finished,
        ];
      }),
    );
    cover.style.clipPath = FULL_COVER(width, height);
    strips.forEach(({ wrapper }) => wrapper.remove());
    swap();
    await wait(HOLD_MS);
    await play(
      cover,
      { clipPath: splitClipFrames(width, height) },
      SPLIT_MS,
      SPLIT_EASING,
    );
  } finally {
    overlay.remove();
  }
};

const createBlurLayer = () => {
  const layer = document.createElement('div');

  layer.setAttribute('aria-hidden', 'true');
  Object.assign(layer.style, {
    position: 'fixed',
    inset: '0',
    zIndex: String(Number(OVERLAY_Z_INDEX) - 1),
    pointerEvents: 'none',
  });

  return layer;
};

const irisProgressAt = (time: number) => {
  if (time < IRIS_APPROACH_END)
    return IRIS_APPROACH_PROGRESS * irisCloseEasing(time / IRIS_APPROACH_END);

  if (time < IRIS_HOLD_END) return IRIS_APPROACH_PROGRESS;

  return (
    IRIS_APPROACH_PROGRESS +
    (1 - IRIS_APPROACH_PROGRESS) *
      irisFinishEasing((time - IRIS_HOLD_END) / (1 - IRIS_HOLD_END))
  );
};

const playIrisClip = (cover: HTMLElement, width: number, height: number) =>
  new Promise<void>((resolve) => {
    const start = performance.now();
    const frame = (now: number) => {
      const time = Math.min(1, (now - start) / COVER_MS);

      cover.style.clipPath = irisClipAt(width, height, irisProgressAt(time));

      if (time < 1) requestAnimationFrame(frame);
      else resolve();
    };

    requestAnimationFrame(frame);
  });

const playIris = async (width: number, height: number, swap: () => void) => {
  const page = document.querySelector<HTMLElement>('main');
  const frame = page?.parentElement ?? null;
  const blur = createBlurLayer();
  const { overlay, cover } = createOverlay(irisClipAt(width, height, 0));
  const effectTiming = {
    duration: COVER_MS * (1 - IRIS_EFFECT_START),
    delay: COVER_MS * IRIS_EFFECT_START,
    easing: IRIS_EASING,
    fill: 'both',
  } as const;

  if (page) {
    const { top } = page.getBoundingClientRect();

    page.style.transformOrigin = `50% ${height / 2 - top}px`;
    page.style.willChange = 'transform';
  }

  if (frame) frame.style.overflow = 'clip';

  document.body.append(blur, overlay);

  const closing = playIrisClip(cover, width, height);
  const zoom = page?.animate(
    { transform: ['scale(1)', `scale(${IRIS_ZOOM})`] },
    effectTiming,
  );
  const blurIn = blur.animate(
    [
      { backdropFilter: 'blur(0px)', webkitBackdropFilter: 'blur(0px)' },
      {
        backdropFilter: `blur(${IRIS_BLUR_PX}px)`,
        webkitBackdropFilter: `blur(${IRIS_BLUR_PX}px)`,
      },
    ],
    effectTiming,
  );

  try {
    await Promise.all([closing, zoom?.finished, blurIn.finished]);
    zoom?.cancel();
    blur.remove();

    if (page) page.style.willChange = '';

    swap();
    await wait(HOLD_MS);
    await play(
      cover,
      { clipPath: splitClipFrames(width, height) },
      SPLIT_MS,
      SPLIT_EASING,
    );
  } finally {
    zoom?.cancel();

    if (page) {
      page.style.transformOrigin = '';
      page.style.willChange = '';
    }

    if (frame) frame.style.overflow = '';

    blur.remove();
    overlay.remove();
  }
};

const measureViewport = () => {
  const probe = document.createElement('div');

  probe.setAttribute('aria-hidden', 'true');
  Object.assign(probe.style, {
    position: 'fixed',
    inset: '0',
    visibility: 'hidden',
    pointerEvents: 'none',
  });
  document.body.append(probe);

  const { width, height } = probe.getBoundingClientRect();

  probe.remove();

  return {
    width: Math.ceil(Math.max(width, window.innerWidth)) + 1,
    height: Math.ceil(Math.max(height, window.innerHeight)) + 1,
  };
};

export const playEncounterTransition = async ({ swap }: EncounterOptions) => {
  const variant = pickVariant();
  const { width, height } = measureViewport();

  if (variant === 'bars') return playBars(width, height, swap);
  if (variant === 'iris') return playIris(width, height, swap);

  const frames =
    variant === 'spiral'
      ? spiralClipFrames(width, height)
      : radialClipFrames(width, height);

  return playClipVariant(frames, width, height, swap);
};
