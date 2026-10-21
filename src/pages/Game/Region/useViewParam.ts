import { useCallback, useEffect, useRef, useState } from 'react';

import { useSearchParams } from 'react-router';

import { type MapView, seedView } from '@/components/map/viewer/viewHandoff';

const VIEW_PARAM = 'view';
const WRITE_DELAY_MS = 500;

const parseView = (value: string | null): MapView | undefined => {
  const [x, y, zoom] = (value ?? '').split(',').map(Number);

  return [x, y, zoom].every(Number.isFinite) ? { x, y, zoom } : undefined;
};

export const useViewParam = () => {
  const [params] = useSearchParams();
  const [initial] = useState(() => {
    const view = parseView(params.get(VIEW_PARAM));

    if (view) seedView(view);

    return view;
  });
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const remember = useCallback(({ x, y, zoom }: MapView) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const url = new URL(window.location.href);

      url.searchParams.set(
        VIEW_PARAM,
        [Math.round(x), Math.round(y), Math.round(zoom * 10) / 10].join(','),
      );
      window.history.replaceState(window.history.state, '', url);
    }, WRITE_DELAY_MS);
  }, []);

  return { restored: initial !== undefined, remember };
};
