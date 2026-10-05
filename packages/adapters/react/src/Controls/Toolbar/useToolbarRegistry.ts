import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { RegisteredToolbarItem } from './ToolbarContext.ts';

export function useToolbarRegistry() {
  const entries = useRef(new Map<string, RegisteredToolbarItem>());
  const [items, setItems] = useState<RegisteredToolbarItem[]>([]);
  const orderedItems = useCallback(() => [...entries.current.values()], []);
  const refresh = useCallback(() => {
    const next = orderedItems();
    setItems((previous) => previous.length === next.length && previous.every((item, index) =>
      item.value === next[index]!.value && item.element === next[index]!.element && item.disabled === next[index]!.disabled)
      ? previous : next);
  }, [orderedItems]);
  useLayoutEffect(refresh);
  const register = useCallback((item: RegisteredToolbarItem) => {
    if (!item.value.trim()) throw new Error('Toolbar item value must not be empty.');
    const previous = entries.current.get(item.value);
    if (previous && previous.element !== item.element) throw new Error(`Duplicate Toolbar item value: ${item.value}`);
    entries.current.set(item.value, item);
    queueMicrotask(refresh);
    return () => {
      if (entries.current.get(item.value) !== item) return;
      entries.current.delete(item.value);
      queueMicrotask(refresh);
    };
  }, [refresh]);
  return { items, register, orderedItems };
}
