import { useEffect, useRef, useState } from 'react';

interface UseExitingItemsOptions<T> {
  items?: T[];
  scopeKey: string;
  getItemKey: (item: T) => string | number;
  exitDuration?: number;
}

export interface ExitingItem<T> {
  key: string;
  item: T;
  isExiting: boolean;
}

const DEFAULT_EXIT_DURATION = 220;

export const useExitingItems = <T>({
  items,
  scopeKey,
  getItemKey,
  exitDuration = DEFAULT_EXIT_DURATION,
}: UseExitingItemsOptions<T>) => {
  const [renderedItems, setRenderedItems] = useState<ExitingItem<T>[]>([]);
  const exitTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const getItemKeyRef = useRef(getItemKey);
  const previousScopeKeyRef = useRef(scopeKey);

  useEffect(() => {
    getItemKeyRef.current = getItemKey;
  }, [getItemKey]);

  useEffect(() => {
    if (!items) {
      return;
    }

    const incomingEntries = items.map((item) => ({
      key: `${scopeKey}:${getItemKeyRef.current(item)}`,
      item,
      isExiting: false,
    }));

    if (previousScopeKeyRef.current !== scopeKey) {
      Object.values(exitTimeoutsRef.current).forEach(clearTimeout);
      exitTimeoutsRef.current = {};
      previousScopeKeyRef.current = scopeKey;
      setRenderedItems(incomingEntries);
      return;
    }

    setRenderedItems(prev => {
      if (prev.length === 0) {
        return incomingEntries;
      }

      const incomingMap = new Map(incomingEntries.map(entry => [entry.key, entry]));
      const prevMap = new Map(prev.map(entry => [entry.key, entry]));
      const next = incomingEntries.map(entry => ({ ...entry, isExiting: false }));

      prev.forEach((entry, index) => {
        if (incomingMap.has(entry.key) || entry.isExiting) {
          return;
        }

        const exitingEntry = { ...entry, isExiting: true };
        const earlierVisibleCount = prev
          .slice(0, index)
          .filter(prevEntry => incomingMap.has(prevEntry.key)).length;
        const earlierExitingCount = prev
          .slice(0, index)
          .filter(prevEntry => !incomingMap.has(prevEntry.key)).length;

        next.splice(earlierVisibleCount + earlierExitingCount, 0, exitingEntry);
      });

      prev.forEach(entry => {
        if (!incomingMap.has(entry.key) && entry.isExiting && !next.some(nextEntry => nextEntry.key === entry.key)) {
          next.push(entry);
        }
      });

      return next.map(entry => {
        const previous = prevMap.get(entry.key);
        if (!previous) {
          return entry;
        }

        return {
          ...entry,
          item: entry.item,
          isExiting: incomingMap.has(entry.key) ? false : previous.isExiting,
        };
      });
    });
  }, [items, scopeKey]);

  useEffect(() => {
    renderedItems.forEach(entry => {
      if (!entry.isExiting || exitTimeoutsRef.current[entry.key]) {
        return;
      }

      exitTimeoutsRef.current[entry.key] = setTimeout(() => {
        setRenderedItems(prev => prev.filter(prevEntry => prevEntry.key !== entry.key));
        delete exitTimeoutsRef.current[entry.key];
      }, exitDuration);
    });

    Object.entries(exitTimeoutsRef.current).forEach(([key, timeoutId]) => {
      const entry = renderedItems.find(renderedEntry => renderedEntry.key === key);
      if (entry?.isExiting) {
        return;
      }

      clearTimeout(timeoutId);
      delete exitTimeoutsRef.current[key];
    });
  }, [exitDuration, renderedItems]);

  useEffect(() => {
    return () => {
      Object.values(exitTimeoutsRef.current).forEach(clearTimeout);
    };
  }, []);

  return renderedItems;
};
