import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { ToastAdapterProps } from './ToastAdapter.tsx';

export type ToastQueueOptions = Omit<ToastAdapterProps, 'open' | 'defaultOpen' | 'onOpenChange'>;

export interface UseToastQueueOptions {
  maxCount?: number;
}

export interface ToastQueueItem {
  id: string;
  props: ToastAdapterProps;
}

export function useToastQueue({ maxCount }: UseToastQueueOptions = {}) {
  if (maxCount !== undefined && (!Number.isSafeInteger(maxCount) || maxCount < 1)) {
    throw new RangeError('Toast maxCount must be a positive safe integer.');
  }
  const limit = maxCount ?? Infinity;
  const prefix = useId();
  const nextId = useRef(0);
  const [entries, setEntries] = useState<{ id: string; props: ToastQueueOptions }[]>([]);

  useEffect(() => {
    setEntries((current) => (current.length > limit ? current.slice(-limit) : current));
  }, [limit, entries.length]);

  const add = useCallback(
    (props: ToastQueueOptions) => {
      const id = `${prefix}-${nextId.current++}`;
      const entry = { id, props: { ...props } };
      setEntries((current) => [...current, entry]);
      return id;
    },
    [prefix],
  );

  const update = useCallback((id: string, props: Partial<ToastQueueOptions>) => {
    const patch = { ...props };
    setEntries((current) =>
      current.map((entry) =>
        entry.id === id ? { ...entry, props: { ...entry.props, ...patch } } : entry,
      ),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const clear = useCallback(() => setEntries([]), []);

  const items: ToastQueueItem[] = entries.slice(-limit).map((entry) => ({
    id: entry.id,
    props: {
      ...entry.props,
      open: true,
      onOpenChange: (open) => {
        if (!open) remove(entry.id);
      },
    },
  }));

  return { items, add, update, remove, clear };
}
