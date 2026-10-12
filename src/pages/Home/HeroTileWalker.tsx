import { type RefObject, useEffect, useRef, useState } from 'react';

import { m, useMotionValue, useTransform } from 'motion/react';

import { createCityPicker } from './heroCities';
import {
  type CityPin,
  createCityPin,
  HeroCityGrid,
  HeroCityMap,
  HeroCityPin,
} from './HeroCityPin';

const LAUNCH_DELAY_MS = 250;
const CRUISE_PIXELS_PER_SECOND = 230;
const LAUNCH_PIXELS_PER_SECOND = 820;
const SLOWDOWN_SECONDS = 0.5;
const TRAIL_SPEED_LIMIT = 340;
const REFERENCE_STAGE_PIXELS = 395;
const MIN_STAGE_SCALE = 0.45;
const MAX_FRAME_SECONDS = 0.05;
const TURN_MIN_PIXELS = 70;
const TURN_MAX_PIXELS = 230;
const MIN_ROOM_PIXELS = 24;
const STAGE_INSET_RATIO = 0.06;
const TRAIL_SPACING = 11;
const TRAIL_FADE_PIXELS = 190;
const PIN_BEHIND_PIXELS = 70;
const PIN_FIRST_DELAY_MS = [1200, 2200];
const PIN_INTERVAL_MS = [2800, 5200];
const PIN_MAX_VISIBLE = 3;
const HISTORY_PIXELS = 400;

type Point = { x: number; y: number };

type Breadcrumb = Point & { distance: number };

type Bounds = { minX: number; maxX: number; minY: number; maxY: number };

type Launch = { start: Point; size: number };

type HeroTileWalkerProps = {
  containerRef: RefObject<HTMLElement | null>;
  startRef: RefObject<HTMLElement | null>;
  stageRef: RefObject<HTMLElement | null>;
  armed: boolean;
  onLaunch: () => void;
};

const directions: Array<Point> = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
];

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

const speedAt = (elapsed: number) =>
  CRUISE_PIXELS_PER_SECOND +
  (LAUNCH_PIXELS_PER_SECOND - CRUISE_PIXELS_PER_SECOND) *
    Math.exp(-elapsed / SLOWDOWN_SECONDS);

const roomAhead = (position: Point, direction: Point, bounds: Bounds) => {
  if (direction.x > 0) return bounds.maxX - position.x;
  if (direction.x < 0) return position.x - bounds.minX;
  if (direction.y > 0) return bounds.maxY - position.y;

  return position.y - bounds.minY;
};

export const HeroTileWalker = ({
  containerRef,
  startRef,
  stageRef,
  armed,
  onLaunch,
}: HeroTileWalkerProps) => {
  const [launch, setLaunch] = useState<Launch | null>(null);

  useEffect(() => {
    if (!armed) return;

    const timer = setTimeout(() => {
      const container = containerRef.current;
      const marker = startRef.current;

      if (!container || !marker) return;

      const origin = container.getBoundingClientRect();
      const dot = marker.getBoundingClientRect();

      setLaunch({
        start: {
          x: dot.left - origin.left + dot.width / 2,
          y: dot.top - origin.top + dot.height / 2,
        },
        size: dot.width,
      });
      onLaunch();
    }, LAUNCH_DELAY_MS);

    return () => clearTimeout(timer);
  }, [armed, containerRef, startRef, onLaunch]);

  if (!launch) return null;

  return (
    <TileWalker
      launch={launch}
      containerRef={containerRef}
      startRef={startRef}
      stageRef={stageRef}
    />
  );
};

type TileWalkerProps = {
  launch: Launch;
  containerRef: RefObject<HTMLElement | null>;
  startRef: RefObject<HTMLElement | null>;
  stageRef: RefObject<HTMLElement | null>;
};

const TileWalker = ({
  launch,
  containerRef,
  startRef,
  stageRef,
}: TileWalkerProps) => {
  const { start } = launch;
  const trailRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(start.x);
  const y = useMotionValue(start.y);
  const [pins, setPins] = useState<Array<CityPin>>([]);
  const size = useMotionValue(launch.size);
  const left = useTransform(
    [x, size],
    ([cx, side]: Array<number>) => cx - side / 2,
  );
  const top = useTransform(
    [y, size],
    ([cy, side]: Array<number>) => cy - side / 2,
  );

  useEffect(() => {
    const trail = trailRef.current;
    const container = containerRef.current;
    const stage = stageRef.current;

    if (!trail || !container || !stage) return;

    let position: Point = { ...start };
    let lastDot: Point = { ...start };
    let bounds: Bounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    let center: Point = { x: 0, y: 0 };
    let waypoints: Array<Point> = [];
    let direction = directions[0];
    let straightLeft = 0;
    let elapsed = 0;
    let previousTime: number | null = null;
    let frame = 0;
    let scale = 1;
    let odometer = 0;
    let pinsStarted = false;
    let pinTimer: ReturnType<typeof setTimeout> | undefined;
    let pinId = 0;
    const history: Array<Breadcrumb> = [];
    const pickCity = createCityPicker();

    const measure = () => {
      const origin = container.getBoundingClientRect();
      const rect = stage.getBoundingClientRect();
      const inset = rect.width * STAGE_INSET_RATIO;
      const left = rect.left - origin.left;
      const top = rect.top - origin.top;

      bounds = {
        minX: left + inset,
        maxX: left + rect.width - inset,
        minY: top + inset,
        maxY: top + rect.height - inset,
      };
      center = { x: left + rect.width / 2, y: top + rect.height / 2 };
      scale = Math.min(
        Math.max(
          Math.min(rect.width, rect.height) / REFERENCE_STAGE_PIXELS,
          MIN_STAGE_SCALE,
        ),
        1,
      );
    };

    const dropDot = (point: Point) => {
      const dot = document.createElement('span');

      dot.className =
        'absolute size-1 -translate-1/2 rounded-full bg-foreground';
      dot.style.left = `${point.x}px`;
      dot.style.top = `${point.y}px`;
      trail.append(dot);

      const fade = dot.animate(
        { opacity: [0.9, 0] },
        {
          duration: (TRAIL_FADE_PIXELS / CRUISE_PIXELS_PER_SECOND) * 1000,
          easing: 'linear',
          fill: 'forwards',
        },
      );

      fade.finished.then(
        () => dot.remove(),
        () => dot.remove(),
      );
    };

    const leaveTrail = (speed: number) => {
      if (speed > TRAIL_SPEED_LIMIT * scale) {
        lastDot = { ...position };

        return;
      }

      let gap = Math.hypot(position.x - lastDot.x, position.y - lastDot.y);

      while (gap >= TRAIL_SPACING) {
        const share = TRAIL_SPACING / gap;

        lastDot = {
          x: lastDot.x + (position.x - lastDot.x) * share,
          y: lastDot.y + (position.y - lastDot.y) * share,
        };
        dropDot(lastDot);
        gap = Math.hypot(position.x - lastDot.x, position.y - lastDot.y);
      }
    };

    const turn = () => {
      measure();

      const sideways = directions.filter(
        (candidate) =>
          candidate.x * direction.x + candidate.y * direction.y === 0 &&
          roomAhead(position, candidate, bounds) >= MIN_ROOM_PIXELS,
      );
      const next =
        sideways.length > 0
          ? sideways[Math.floor(Math.random() * sideways.length)]
          : { x: -direction.x, y: -direction.y };

      direction = next;
      straightLeft = Math.min(
        randomBetween(TURN_MIN_PIXELS * scale, TURN_MAX_PIXELS * scale),
        Math.max(roomAhead(position, direction, bounds), MIN_ROOM_PIXELS),
      );
    };

    const advanceToWaypoints = (distance: number) => {
      let remaining = distance;

      while (remaining > 0 && waypoints.length > 0) {
        const target = waypoints[0];
        const gap = Math.hypot(target.x - position.x, target.y - position.y);

        if (gap <= remaining) {
          const deltaX = target.x - position.x;
          const deltaY = target.y - position.y;

          direction =
            Math.abs(deltaX) >= Math.abs(deltaY)
              ? { x: Math.sign(deltaX) || direction.x, y: 0 }
              : { x: 0, y: Math.sign(deltaY) };
          position = { ...target };
          remaining -= gap;
          waypoints.shift();

          if (waypoints.length === 0) {
            straightLeft = 0;
            return remaining;
          }
        } else {
          position = {
            x: position.x + ((target.x - position.x) / gap) * remaining,
            y: position.y + ((target.y - position.y) / gap) * remaining,
          };
          remaining = 0;
        }
      }

      return remaining;
    };

    const advanceFreely = (distance: number) => {
      let remaining = distance;
      let guard = 0;

      while (remaining > 0 && guard < 8) {
        guard += 1;

        if (straightLeft <= 0) turn();

        const step = Math.min(
          remaining,
          straightLeft,
          Math.max(roomAhead(position, direction, bounds), 0),
        );

        position = {
          x: position.x + direction.x * step,
          y: position.y + direction.y * step,
        };
        straightLeft -= step;
        remaining -= step;

        if (step === 0) straightLeft = 0;
      }
    };

    const dropPin = () => {
      const wanted = odometer - PIN_BEHIND_PIXELS;
      const spot = history.findLast((crumb) => crumb.distance <= wanted);

      if (!spot) return;

      pinId += 1;

      const pin = createCityPin(
        pinId,
        pickCity(),
        spot,
        container.getBoundingClientRect().width,
      );

      setPins((current) => [...current.slice(-(PIN_MAX_VISIBLE - 1)), pin]);
    };

    const schedulePin = (range: Array<number>) => {
      pinTimer = setTimeout(
        () => {
          dropPin();
          schedulePin(PIN_INTERVAL_MS);
        },
        randomBetween(range[0], range[1]),
      );
    };

    const remember = (previous: Point) => {
      odometer += Math.hypot(position.x - previous.x, position.y - previous.y);
      history.push({ ...position, distance: odometer });

      while (
        history.length > 0 &&
        history[0].distance < odometer - HISTORY_PIXELS
      ) {
        history.shift();
      }
    };

    const tick = (time: number) => {
      const seconds =
        previousTime === null
          ? 0
          : Math.min((time - previousTime) / 1000, MAX_FRAME_SECONDS);

      previousTime = time;
      elapsed += seconds;

      const previous = { ...position };
      const speed = speedAt(elapsed) * scale;
      const distance = speed * seconds;

      if (waypoints.length > 0) {
        const leftover = advanceToWaypoints(distance);

        if (waypoints.length === 0) advanceFreely(leftover);
      } else {
        advanceFreely(distance);
      }

      remember(previous);

      if (!pinsStarted && waypoints.length === 0) {
        pinsStarted = true;
        schedulePin(PIN_FIRST_DELAY_MS);
      }

      x.set(position.x);
      y.set(position.y);
      leaveTrail(speed);
      frame = requestAnimationFrame(tick);
    };

    const clampToBounds = (point: Point): Point => ({
      x: Math.min(Math.max(point.x, bounds.minX), bounds.maxX),
      y: Math.min(Math.max(point.y, bounds.minY), bounds.maxY),
    });

    const approach = () => {
      const horizontalFirst = Math.abs(center.x - position.x) > 1;

      waypoints = horizontalFirst
        ? [{ x: center.x, y: position.y }, center]
        : [center];
    };

    const relayout = () => {
      measure();

      const marker = startRef.current;

      if (marker) size.set(marker.getBoundingClientRect().width);

      if (waypoints.length > 0) {
        approach();

        return;
      }

      const inside = clampToBounds(position);

      if (inside.x !== position.x || inside.y !== position.y) {
        waypoints = [inside];
        straightLeft = 0;
      }
    };

    measure();

    approach();
    direction = { x: Math.sign(center.x - start.x) || 1, y: 0 };
    frame = requestAnimationFrame(tick);

    const observer = new ResizeObserver(relayout);

    observer.observe(container);
    observer.observe(stage);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(pinTimer);
      observer.disconnect();
    };
  }, [containerRef, startRef, stageRef, start, size, x, y]);

  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {pins.map((pin) => (
          <HeroCityGrid key={pin.id} pin={pin} />
        ))}
        {pins.map((pin) => (
          <HeroCityMap key={`map-${pin.id}`} pin={pin} />
        ))}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 z-20">
        <div ref={trailRef} className="absolute inset-0" />
        {pins.map((pin) => (
          <HeroCityPin
            key={pin.id}
            pin={pin}
            onDone={(id) =>
              setPins((current) => current.filter((item) => item.id !== id))
            }
          />
        ))}
        <m.span
          className="absolute bg-brand shadow-[0_0_24px_oklch(0.74_0.15_145/0.7)]"
          style={{ width: size, height: size, x: left, y: top }}
        />
      </div>
    </>
  );
};
