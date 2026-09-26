import { useLocation, useNavigate, useSearchParams } from 'react-router';

const POKEDEX_PARAM = 'pokedex';

type PokedexState = { openedInApp?: boolean };

export const pokedexLink = {
  to: { search: `?${POKEDEX_PARAM}` },
  state: { openedInApp: true } satisfies PokedexState,
};

export const usePokedex = () => {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const open = params.has(POKEDEX_PARAM);
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

  return { open, close };
};
