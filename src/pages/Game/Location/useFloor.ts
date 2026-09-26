import { useSearchParams } from 'react-router';

import type { LocationFloor } from '@/data/maps';

const FLOOR_PARAM = 'floor';

export const useFloor = (floors: Array<LocationFloor> | undefined) => {
  const [params, setParams] = useSearchParams();

  const requested = params.get(FLOOR_PARAM);
  const floor = floors?.find(({ id }) => id === requested) ?? floors?.at(0);

  const selectFloor = (id: string) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current);

        next.set(FLOOR_PARAM, id);

        return next;
      },
      { replace: true, preventScrollReset: true },
    );

  return { floor, selectFloor };
};
