import { type ReactNode, type RefObject, useRef } from 'react';

import { useLocation, useNavigationType, useOutlet } from 'react-router';
import { SwitchTransition, Transition } from 'react-transition-group';
import type { TransitionProps } from 'react-transition-group/Transition';

import type { Direction } from '@/data/maps';
import {
  easeSineIn,
  easeSineOut,
  prefersReducedMotion,
  type TravelState,
} from '@/lib/motion';
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
    return { enterFrom: offset([x, y]), exitTo: offset([-x, -y]) };
  }
  const change = depthOf(to) - depthOf(from);
  if (change > 0) return { enterFrom: 'scale(0.96)', exitTo: 'scale(1.04)' };
  if (change < 0) return { enterFrom: 'scale(1.04)', exitTo: 'scale(0.96)' };
  return slideMotion;
};

type PageTransitionProps = {
  depth?: number;
  mapMotion?: boolean;
};

export default function PageTransition({
  depth,
  mapMotion = false,
}: PageTransitionProps) {
  const { pathname } = useLocation();
  const outlet = useOutlet();
  const key = pageKey(pathname, depth);
  const motionRef = useRef<Motion>(undefined);

  return (
    <SwitchTransition>
      <PageFrame
        key={key}
        path={key}
        depth={depth}
        mapMotion={mapMotion}
        motionRef={motionRef}
      >
        {outlet}
      </PageFrame>
    </SwitchTransition>
  );
}

const pageKey = (pathname: string, depth: number | undefined) =>
  depth === undefined
    ? pathname
    : `/${pathSegments(pathname).slice(0, depth).join('/')}`;

function PageFrame({
  children,
  path,
  depth,
  mapMotion,
  motionRef,
  ...transitionProps
}: {
  children: ReactNode;
  path: string;
  depth: number | undefined;
  mapMotion: boolean;
  motionRef: RefObject<Motion | undefined>;
} & Pick<TransitionProps<HTMLDivElement>, 'in' | 'onExited'>) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const { pathname, state } = useLocation();
  const navigationType = useNavigationType();
  const travel =
    navigationType === 'POP'
      ? undefined
      : (state as TravelState | null)?.travel;
  const nextPath = pageKey(pathname, depth);

  const animate = (keyframes: Keyframe[], duration: number, easing: string) =>
    nodeRef.current?.animate(keyframes, {
      duration: prefersReducedMotion() ? 0 : duration,
      easing,
      fill: 'both',
    });

  return (
    <Transition
      {...transitionProps}
      nodeRef={nodeRef}
      timeout={{ enter: ENTER_MS, exit: EXIT_MS }}
      onEnter={() => {
        window.scrollTo(0, 0);
        const { enterFrom } = motionRef.current ?? slideMotion;
        const animation = animate(
          [
            { transform: enterFrom, opacity: 0 },
            { transform: 'none', opacity: 1 },
          ],
          ENTER_MS,
          easeSineOut,
        );
        animation?.finished
          .then(() => {
            animation.cancel();
            const { hash } = window.location;
            if (hash) {
              document
                .getElementById(decodeURIComponent(hash.slice(1)))
                ?.scrollIntoView();
            }
          })
          .catch(() => {});
      }}
      onExit={() => {
        const motion = motionFor(path, nextPath, travel, mapMotion);
        motionRef.current = motion;
        animate(
          [
            { transform: 'none', opacity: 1 },
            { transform: motion.exitTo, opacity: 0 },
          ],
          EXIT_MS,
          easeSineIn,
        );
      }}
    >
      <div ref={nodeRef} className="flex flex-1 flex-col">
        {children}
      </div>
    </Transition>
  );
}
