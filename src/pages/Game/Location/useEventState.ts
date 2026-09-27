import { useSearchParams } from 'react-router';

const EVENT_PARAM = 'event';

export type EventState = 'before' | 'after';

export const useEventState = () => {
  const [params, setParams] = useSearchParams();

  const state: EventState =
    params.get(EVENT_PARAM) === 'after' ? 'after' : 'before';

  const selectState = (next: EventState) =>
    setParams(
      (current) => {
        const updated = new URLSearchParams(current);

        if (next === 'after') updated.set(EVENT_PARAM, next);
        else updated.delete(EVENT_PARAM);

        return updated;
      },
      { replace: true, preventScrollReset: true },
    );

  return { state, selectState };
};
