import { type RefObject, useEffect, useState } from 'react';

export const useTokenValues = (
  scope: RefObject<HTMLElement | null>,
  tokens: Array<string>,
) => {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const element = scope.current;

    if (!element) return;

    const read = () => {
      const styles = getComputedStyle(element);

      setValues(
        Object.fromEntries(
          tokens.map((token) => [
            token,
            styles.getPropertyValue(`--${token}`).trim(),
          ]),
        ),
      );
    };
    const observer = new MutationObserver(read);

    read();
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [scope, tokens]);

  return values;
};
