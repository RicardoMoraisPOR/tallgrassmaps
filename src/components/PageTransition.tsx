import {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { useLocation, useNavigationType, useOutlet } from 'react-router';

import type { Direction } from '@/data/maps';
import { prefersReducedMotion } from '@/lib/media';
import { easeSineIn, easeSineOut, type TravelState } from '@/lib/motion';
import { pathSegments } from '@/lib/paths';

const EXIT_MS = 200;
const ENTER_MS = 300;
const DISTANCE = 40;

const VECTORS: Record<Direction, [x: number, y: number]> = {
  north: [0, -1],
  south: [0, 1],
  east: [1, 0],
  west: [-1, 0],
};

const offset = ([x, y]: [number, number]) =>
  `translate(${x * DISTANCE}px, ${y * DISTANCE}px)`;

const screenOffset = ([x, y]: [number, number]) =>
  `translate(${x * 100}vw, ${y * 100}vh)`;

type Motion = {
  enterFrom: string;
  exitTo: string;
};

const depthOf = (path: string) => pathSegments(path).length;

const slideMotion: Motion = {
  enterFrom: offset([0, 1]),
  exitTo: offset([0, 1]),
};

const motionFor = (
  from: string,
  to: string,
  travel: Direction | undefined,
  mapMotion: boolean,
): Motion => {
  if (!mapMotion) return slideMotion;

  if (travel) {
    const [x, y] = VECTORS[travel];

    return {
      enterFrom: screenOffset([x, y]),
      exitTo: screenOffset([-x, -y]),
    };
  }

  const change = depthOf(to) - depthOf(from);

  if (change > 0) return { enterFrom: 'scale(0.96)', exitTo: 'scale(1.04)' };
  if (change < 0) return { enterFrom: 'scale(1.04)', exitTo: 'scale(0.96)' };

  return slideMotion;
};

const TARGET_SELECTOR = '[data-page-transition-target]';
const LOADING_SELECTOR = '[data-page-loading]';

const transitionTarget = (node: HTMLElement | null) =>
  node?.querySelector<HTMLElement>(TARGET_SELECTOR) ?? node;

const play = (
  element: HTMLElement | null,
  keyframes: Array<Keyframe>,
  duration: number,
  easing: string,
) =>
  element?.animate(keyframes, {
    duration: prefersReducedMotion() ? 0 : duration,
    easing,
    fill: 'both',
  });

type PageTransitionProps = {
  depth?: number;
  mapMotion?: boolean;
  keyFor?: (pathname: string) => string;
  children?: ReactNode;
};

type Frame = { key: string; content: ReactNode; entering: boolean };

const pageKey = (pathname: string, depth: number | undefined) =>
  depth === undefined
    ? pathname
    : `/${pathSegments(pathname).slice(0, depth).join('/')}`;

export const PageTransition = ({
  depth,
  mapMotion = false,
  keyFor,
  children,
}: PageTransitionProps) => {
  const { pathname, state } = useLocation();
  const navigationType = useNavigationType();
  const outlet = useOutlet();
  const node = useRef<HTMLDivElement>(null);
  const motion = useRef<Motion>(slideMotion);
  const shownPath = useRef(pathname);

  const keyOf = keyFor ?? ((path: string) => pageKey(path, depth));
  const key = keyOf(pathname);
  const content = children ?? outlet;
  const [frame, setFrame] = useState<Frame>({
    key,
    content,
    entering: false,
  });
  const latest = useRef({ key, content });
  const leaving = frame.key !== key;
  const travel =
    navigationType === 'POP'
      ? undefined
      : (state as TravelState | null)?.travel;

  if (!leaving && frame.content !== content) setFrame({ ...frame, content });

  useEffect(() => {
    latest.current = { key, content };
  }, [key, content]);

  useEffect(() => {
    if (!leaving) shownPath.current = pathname;
  }, [leaving, pathname]);

  useEffect(() => {
    if (!leaving) return;

    let cancelled = false;

    motion.current = motionFor(shownPath.current, pathname, travel, mapMotion);

    const exit = play(
      transitionTarget(node.current),
      [
        { transform: 'none', opacity: 1 },
        { transform: motion.current.exitTo, opacity: 0 },
      ],
      EXIT_MS,
      easeSineIn,
    );
    const swap = () => {
      if (cancelled) return;

      shownPath.current = pathname;
      setFrame({ ...latest.current, entering: true });
    };

    if (exit) exit.finished.then(swap, () => {});
    else swap();

    return () => {
      cancelled = true;
      exit?.cancel();
    };
  }, [leaving, key, frame.key, pathname, travel, mapMotion]);

  useLayoutEffect(() => {
    if (!frame.entering) return undefined;

    window.scrollTo(0, 0);

    const enterOn = (element: HTMLElement | null) => {
      const enter = play(
        element,
        [
          { transform: motion.current.enterFrom, opacity: 0 },
          { transform: 'none', opacity: 1 },
        ],
        ENTER_MS,
        easeSineOut,
      );

      void enter?.finished.then(
        () => {
          enter.cancel();

          const { hash } = window.location;

          if (hash)
            document
              .getElementById(decodeURIComponent(hash.slice(1)))
              ?.scrollIntoView();
        },
        () => {},
      );
    };

    const root = node.current;
    const loading = () => root?.querySelector(LOADING_SELECTOR) != null;

    if (!root || !loading() || root.querySelector(TARGET_SELECTOR)) {
      enterOn(transitionTarget(root));

      return undefined;
    }

    const observer = new MutationObserver(() => {
      if (loading() && !root.querySelector(TARGET_SELECTOR)) return;

      observer.disconnect();
      enterOn(transitionTarget(root));
    });

    observer.observe(root, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [frame.key, frame.entering]);

  return (
    <div key={frame.key} ref={node} className="flex flex-1 flex-col">
      {frame.content}
    </div>
  );
};
