import { useRef } from 'react';

import { useTokenValues } from './useTokenValues';

type TokenSwatchesProps = { tokens: Array<string> };

export const TokenSwatches = ({ tokens }: TokenSwatchesProps) => {
  const scope = useRef<HTMLUListElement>(null);
  const values = useTokenValues(scope, tokens);

  return (
    <ul
      ref={scope}
      className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-2"
    >
      {tokens.map((token) => (
        <li
          key={token}
          className="flex items-center gap-2 rounded-lg border p-2"
        >
          <span
            aria-hidden
            className="size-9 flex-none rounded-md border"
            style={{ background: `var(--${token})` }}
          />
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-mono text-xs">--{token}</span>
            <span className="truncate font-mono text-[10px] text-muted-foreground">
              {values[token]}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
};
