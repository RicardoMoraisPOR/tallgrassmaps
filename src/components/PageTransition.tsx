import {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { LoaderCircle } from 'lucide-react';
import { useLocation, useNavigationType, useOutlet } from 'react-router';

import type { Direction } from '@/data/maps';
import { prefersReducedMotion } from '@/lib/media';
import { easeSineIn, easeSineOut, type TravelState } from '@/lib/motion';
import { pathSegments } from '@/lib/paths';

const EXIT_MS = 200;
const ENTER_MS = 150;
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
const PENDING_ATTRIBUTE = 'data-page-transition-pending';
const READY_TIMEOUT_MS = 2000;
const LOADING_DELAY_MS = 250;

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
  holdForReady?: boolean;
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
  holdForReady = true,
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
  const [holding, setHolding] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
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
    const targetOf = () =>
      root?.querySelector<HTMLElement>(TARGET_SELECTOR) ?? null;
    const skeleton = () => root?.querySelector(LOADING_SELECTOR) != null;
    const waiting = () => {
      const target = targetOf();

      return target
        ? holdForReady && target.hasAttribute(PENDING_ATTRIBUTE)
        : skeleton();
    };
    const hold = () => {
      const target = targetOf();

      if (holdForReady && target?.hasAttribute(PENDING_ATTRIBUTE))
        target.style.opacity = '0';
    };
    const start = () => {
      const target = targetOf();

      setHolding(false);

      if (target) target.style.opacity = '';

      enterOn(transitionTarget(root));
    };

    if (!root || !waiting()) {
      start();

      return undefined;
    }

    hold();
    setHolding(true);

    const observer = new MutationObserver(() => {
      if (waiting()) {
        hold();

        return;
      }

      observer.disconnect();
      clearTimeout(timer);
      start();
    });
    const timer = setTimeout(() => {
      observer.disconnect();
      start();
    }, READY_TIMEOUT_MS);

    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [PENDING_ATTRIBUTE],
    });

    return () => {
      observer.disconnect();
      clearTimeout(timer);
      setHolding(false);
    };
  }, [frame.key, frame.entering, holdForReady]);

  useEffect(() => {
    if (!holding) {
      setShowLoading(false);

      return undefined;
    }

    const timer = setTimeout(() => setShowLoading(true), LOADING_DELAY_MS);

    return () => clearTimeout(timer);
  }, [holding]);

  return (
    <div key={frame.key} ref={node} className="relative flex flex-1 flex-col">
      {frame.content}
      {showLoading && (
        <div
          role="status"
          aria-label="Loading"
          className="pointer-events-none absolute inset-0 z-10 grid place-items-center"
        >
          <LoaderCircle className="size-6 animate-spin text-muted-foreground motion-reduce:animate-none" />
        </div>
      )}
    </div>
  );
};
