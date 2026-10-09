import { useLocation, useNavigate, useSearchParams } from 'react-router';

const POKEDEX_PARAM = 'pokedex';

type PokedexState = { openedInApp?: boolean };

export const pokedexLink = (params: URLSearchParams, number?: number) => {
  const kept = new URLSearchParams(params);
  const pokedex = number ? `${POKEDEX_PARAM}=${number}` : POKEDEX_PARAM;

  kept.delete(POKEDEX_PARAM);

  return {
    to: {
      search: `?${[kept.toString(), pokedex].filter(Boolean).join('&')}`,
    },
    state: { openedInApp: true } satisfies PokedexState,
  };
};

export const usePokedexLink = (number?: number) => {
  const [params] = useSearchParams();

  return pokedexLink(params, number);
};

export const usePokedex = () => {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const open = params.has(POKEDEX_PARAM);
  const focus = Number(params.get(POKEDEX_PARAM)) || undefined;
  const openedInApp = (location.state as PokedexState | null)?.openedInApp;

  const close = () => {
    if (openedInApp) {
      navigate(-1);

      return;
    }

    setParams(
      (current) => {
        const next = new URLSearchParams(current);

        next.delete(POKEDEX_PARAM);

        return next;
      },
      { replace: true },
    );
  };

  return { open, focus, close };
};
