import { useSearchParams } from 'react-router';

import type { LocationFloor } from '@/data/maps';

import { arrivalKey } from './links/arrivals';

const FLOOR_PARAM = 'floor';
const VIA_PARAM = 'via';
const FROM_PARAM = 'from';

export const useFloor = (floors: Array<LocationFloor> | undefined) => {
  const [params, setParams] = useSearchParams();

  const requested = params.get(FLOOR_PARAM);
  const floor = floors?.find(({ id }) => id === requested) ?? floors?.at(0);
  const via = params.get(VIA_PARAM);
  const arrivedAt = via ? arrivalKey(via) : undefined;
  const from = params.get(FROM_PARAM) ?? undefined;

  const selectFloor = (id: string) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current);

        next.set(FLOOR_PARAM, id);
        next.delete(VIA_PARAM);
        next.delete(FROM_PARAM);

        return next;
      },
      { replace: true, preventScrollReset: true },
    );

  return { floor, arrivedAt, from, selectFloor };
};
