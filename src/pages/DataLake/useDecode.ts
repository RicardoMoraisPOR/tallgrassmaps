import { useEffect, useState } from 'react';

import { prefersReducedMotion } from '@/lib/media';

const GLYPHS = '01{}<>/\\#$%&*+=?';
const FRAME_MS = 40;
const KEEP = /[\s.,:'’\-–·()%›]/;

const scramble = (text: string, resolved: number) =>
  [...text]
    .map((char, index) =>
      index < resolved || KEEP.test(char)
        ? char
        : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
    )
    .join('');

export const useDecode = (
  text: string,
  start: boolean,
  delayMs: number,
  durationMs: number,
) => {
  const [shown, setShown] = useState<string>();

  useEffect(() => {
    if (!start || prefersReducedMotion()) return;

    const length = [...text].length;
    let frame = 0;
    let begin: number | undefined;
    let last = 0;

    const tick = (now: number) => {
      begin ??= now;

      const elapsed = now - begin - delayMs;

      if (elapsed >= durationMs) {
        setShown(undefined);

        return;
      }

      if (now - last >= FRAME_MS) {
        last = now;
        setShown(
          scramble(
            text,
            elapsed < 0 ? 0 : Math.floor((elapsed / durationMs) * length),
          ),
        );
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [text, start, delayMs, durationMs]);

  return { text: shown ?? text, decoding: shown !== undefined };
};
