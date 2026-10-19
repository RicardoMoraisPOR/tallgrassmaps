import type { ReactNode } from 'react';

export const ZaFrame = ({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) =>
  active ? (
    <div className="pokedex-za za-popup w-max max-w-full">{children}</div>
  ) : (
    children
  );
