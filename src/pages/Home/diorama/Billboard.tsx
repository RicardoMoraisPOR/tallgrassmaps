import type { CSSProperties, ReactNode } from 'react';

type BillboardProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  lift?: number;
  children: ReactNode;
  style?: CSSProperties;
};

export const billboardTransform =
  'rotateZ(calc(var(--rz) * -1)) rotateX(calc(var(--rx) * -1))';

export const Billboard = ({
  x,
  y,
  width,
  height,
  lift = 0,
  children,
  style,
}: BillboardProps) => (
  <div
    className="absolute"
    style={{
      left: x - width / 2,
      top: y - height,
      width,
      height,
      transformOrigin: '50% 100%',
      transform: `translateZ(calc(var(--surface, 0px) + ${lift}px)) ${billboardTransform}`,
      ...style,
    }}
  >
    {children}
  </div>
);
