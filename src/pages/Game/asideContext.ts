import { createContext, useCallback, useContext } from 'react';

import type { LucideIcon } from 'lucide-react';

export type CardInfo = {
  id: string;
  label: string;
  icon: LucideIcon;
  to?: string;
  defaultOpen?: boolean;
  drawer?: boolean;
  onMobileOpen?: () => void;
};

export type AsideState = {
  modal: boolean;
  isOpen: (id: string, fallback?: boolean) => boolean;
  close: (id: string) => void;
  register: (card: CardInfo) => () => void;
};

export const AsideContext = createContext<AsideState>({
  modal: false,
  isOpen: () => true,
  close: () => {},
  register: () => () => {},
});

export const CardContext = createContext<string | undefined>(undefined);

export const useCloseCard = () => {
  const { modal, close } = useContext(AsideContext);
  const label = useContext(CardContext);

  return useCallback(() => {
    if (modal && label) close(label);
  }, [modal, label, close]);
};

export const useModalCard = () => useContext(AsideContext).modal;
