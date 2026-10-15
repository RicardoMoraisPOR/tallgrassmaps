import { useEffect, useRef, useState } from 'react';

import { animate, m, useMotionValue } from 'motion/react';

import type { Bounds, CritterHandle } from './Swarm';

const BALL_SIZE = 30;
const FLIGHT_SECONDS = 0.7;
const BURST_SECONDS = 0.55;
const ARC_HEIGHT_RATIO = 0.35;
const SPINS = 3;
const START_BELOW_PIXELS = 24;
const WOBBLES = 3;
const WOBBLE_SECONDS = 0.7;
const WOBBLE_PAUSE_MS = 330;
const CATCH_CHANCE = 0.5;
const SPARKLES = 7;
const SPARKLE_RADIUS = 46;
const CAUGHT_LINGER_MS = 1000;
const ESCAPED_LINGER_MS = 900;

export type Throw = { key: number; x: number; y: number; id?: number };

type BallProps = {
  bounds: Bounds;
  target: Throw;
  onLand: (target: Throw) => CritterHandle | null;
  follow: (id: number) => CritterHandle | undefined;
  onDone: () => void;
  catchChance?: number;
};

type Phase = 'flying' | 'miss' | 'hold' | 'caught' | 'escaped';

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const BallArt = () => (
  <svg viewBox="0 0 32 32" width={BALL_SIZE} height={BALL_SIZE} aria-hidden>
    <circle
      cx="16"
      cy="16"
      r="14"
      fill="#f4f4f4"
      stroke="#1c1c1c"
      strokeWidth="2"
    />
    <path
      d="M2 16a14 14 0 0 1 28 0z"
      fill="#e5483d"
      stroke="#1c1c1c"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M2 16h28" stroke="#1c1c1c" strokeWidth="2.5" />
    <circle
      cx="16"
      cy="16"
      r="4.4"
      fill="#f4f4f4"
      stroke="#1c1c1c"
      strokeWidth="2"
    />
  </svg>
);

const Ball = ({
  bounds,
  target,
  onLand,
  follow,
  onDone,
  catchChance = CATCH_CHANCE,
}: BallProps) => {
  const startX = bounds.width / 2;
  const startY = bounds.height + START_BELOW_PIXELS;
  const x = useMotionValue(startX);
  const y = useMotionValue(startY);
  const rotate = useMotionValue(0);
  const scale = useMotionValue(1.25);
  const [phase, setPhase] = useState<Phase>('flying');
  const land = useRef(onLand);
  const chase = useRef(follow);
  const done = useRef(onDone);

  useEffect(() => {
    land.current = onLand;
    chase.current = follow;
    done.current = onDone;
  }, [onLand, follow, onDone]);

  useEffect(() => {
    let cancelled = false;
    const running: Array<{ stop: () => void }> = [];
    const aim = { x: target.x, y: target.y };
    const arc = Math.max(90, Math.abs(startY - target.y) * ARC_HEIGHT_RATIO);

    const capture = async (critter: CritterHandle) => {
      setPhase('hold');
      running.push(
        animate(x, critter.x.get(), { duration: 0.15 }),
        animate(y, critter.y.get(), { duration: 0.15 }),
        animate(scale, 0.95, { duration: 0.15 }),
      );
      await wait(450);

      for (let wobble = 0; wobble < WOBBLES && !cancelled; wobble++) {
        const swing = animate(rotate, [0, -28, 0, 28, 0], {
          duration: WOBBLE_SECONDS,
          ease: 'easeInOut',
        });

        running.push(swing);
        await swing;
        await wait(WOBBLE_PAUSE_MS);
      }

      if (cancelled) return;

      const caught = Math.random() < catchChance;

      setPhase(caught ? 'caught' : 'escaped');

      critter.finish(caught);
      await wait(caught ? CAUGHT_LINGER_MS : ESCAPED_LINGER_MS);

      if (!cancelled) done.current();
    };

    const flight = animate(0, 1, {
      duration: FLIGHT_SECONDS,
      ease: 'linear',
      onUpdate: (t) => {
        const eased = 1 - (1 - t) * (1 - t) * 0.6 - 0.4 * (1 - t);
        const chased =
          target.id === undefined ? undefined : chase.current(target.id);

        aim.x = chased?.x.get() ?? aim.x;
        aim.y = chased?.y.get() ?? aim.y;
        x.set(startX + (aim.x - startX) * eased);
        y.set(startY + (aim.y - startY) * eased - arc * 4 * t * (1 - t));
        rotate.set(t * 360 * SPINS);
        scale.set(1.25 - 0.45 * t);
      },
      onComplete: () => {
        const critter = land.current(target);

        if (!critter) {
          setPhase('miss');
          setTimeout(() => done.current(), BURST_SECONDS * 1000);

          return;
        }

        void capture(critter);
      },
    });

    running.push(flight);

    return () => {
      cancelled = true;
      running.forEach((controls) => controls.stop());
    };
  }, [startX, startY, target, x, y, rotate, scale]);

  const faded = phase === 'miss' || phase === 'escaped';
  const halfStyle = { width: BALL_SIZE, height: BALL_SIZE };

  return (
    <m.div
      aria-hidden
      className="pointer-events-none absolute top-0 left-0 z-[5]"
      style={{ x, y, marginLeft: -BALL_SIZE / 2, marginTop: -BALL_SIZE / 2 }}
    >
      <m.div
        style={{ rotate, scale }}
        animate={
          faded
            ? { opacity: 0 }
            : phase === 'caught'
              ? { opacity: 0, filter: 'brightness(0.75)' }
              : { opacity: 1 }
        }
        transition={
          phase === 'caught'
            ? { duration: 0.4, delay: 0.6 }
            : { duration: BURST_SECONDS * 0.6 }
        }
      >
        <BallArt />
      </m.div>
      {phase === 'hold' && (
        <m.div
          className="absolute top-1/2 left-1/2 rounded-full bg-[#ff6a5c]"
          style={{ width: BALL_SIZE, height: BALL_SIZE, x: '-50%', y: '-50%' }}
          initial={{ scale: 2.6, opacity: 0.8 }}
          animate={{ scale: 0.3, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeIn' }}
        />
      )}
      {phase === 'miss' && (
        <>
          <m.div
            className="absolute top-1/2 left-1/2 rounded-full border-2 border-brand"
            style={{ ...halfStyle, x: '-50%', y: '-50%' }}
            initial={{ scale: 0.4, opacity: 0.9 }}
            animate={{ scale: 3.2, opacity: 0 }}
            transition={{ duration: BURST_SECONDS, ease: 'easeOut' }}
          />
          <m.div
            className="absolute top-1/2 left-1/2 rounded-full bg-white"
            style={{ ...halfStyle, x: '-50%', y: '-50%' }}
            initial={{ scale: 0.6, opacity: 0.85 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: BURST_SECONDS * 0.7, ease: 'easeOut' }}
          />
        </>
      )}
      {phase === 'escaped' && (
        <>
          <m.div
            className="absolute top-1/2 left-1/2 rounded-full bg-[#ff6a5c]"
            style={{ ...halfStyle, x: '-50%', y: '-50%' }}
            initial={{ scale: 0.5, opacity: 0.9 }}
            animate={{ scale: 4.4, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          {[
            { clip: 'inset(0 0 50% 0)', x: -22, y: -34, rotate: -55 },
            { clip: 'inset(50% 0 0 0)', x: 22, y: 30, rotate: 50 },
          ].map(({ clip, ...fly }) => (
            <m.div
              key={clip}
              className="absolute top-1/2 left-1/2"
              style={{
                ...halfStyle,
                marginLeft: -BALL_SIZE / 2,
                marginTop: -BALL_SIZE / 2,
                clipPath: clip,
              }}
              initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
              animate={{ ...fly, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <BallArt />
            </m.div>
          ))}
        </>
      )}
      {phase === 'caught' &&
        Array.from({ length: SPARKLES }, (_, index) => {
          const angle = (index / SPARKLES) * Math.PI * 2 - Math.PI / 2;

          return (
            <m.span
              key={index}
              className="absolute top-1/2 left-1/2 flex size-4 items-center justify-center text-[15px] leading-none text-[#f6c945]"
              style={{ marginLeft: -8, marginTop: -8 }}
              initial={{ x: 0, y: 0, scale: 0.3, opacity: 1, rotate: 0 }}
              animate={{
                x: Math.cos(angle) * SPARKLE_RADIUS,
                y: Math.sin(angle) * SPARKLE_RADIUS,
                scale: 1.1,
                opacity: 0,
                rotate: 90,
              }}
              transition={{ duration: 0.85, ease: 'easeOut' }}
            >
              ✦
            </m.span>
          );
        })}
    </m.div>
  );
};

export const Pokeballs = ({
  throws,
  bounds,
  onLand,
  follow,
  onDone,
  catchChance,
}: {
  throws: Array<Throw>;
  bounds: Bounds;
  onLand: (target: Throw) => CritterHandle | null;
  follow: (id: number) => CritterHandle | undefined;
  onDone: (key: number) => void;
  catchChance?: number;
}) => (
  <>
    {throws.map((item) => (
      <Ball
        key={item.key}
        bounds={bounds}
        target={item}
        onLand={onLand}
        follow={follow}
        onDone={() => onDone(item.key)}
        catchChance={catchChance}
      />
    ))}
  </>
);
