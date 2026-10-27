import { useCallback, useState } from 'react';

const STORAGE_KEY = 'tallgrassmaps:todo-done';

const readDone = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    return new Set<string>(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set<string>();
  }
};

export const useTodoState = () => {
  const [done, setDone] = useState(readDone);

  const toggle = useCallback((id: string) => {
    setDone((current) => {
      const next = new Set(current);

      if (!next.delete(id)) next.add(id);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // storage unavailable, state stays in memory
      }

      return next;
    });
  }, []);

  return { done, toggle };
};
