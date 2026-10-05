import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { FocusEvent, RefObject } from 'react';
import type { RegisteredToolbarItem } from './ToolbarContext.ts';

const useCommitEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;

export function useToolbarRegistry(root: RefObject<HTMLDivElement | null>, navigation: 'roving' | 'native') {
  const entries = useRef(new Map<string, RegisteredToolbarItem>());
  const focused = useRef<HTMLElement | null>(null);
  const [items, setItems] = useState<RegisteredToolbarItem[]>([]);
  const orderedItems = useCallback(() => [...entries.current.values()]
    .map((item) => ({ ...item, disabled: item.disabled || !item.element.isConnected || item.element.matches(':disabled') }))
    .sort((left, right) => {
      const position = left.element.compareDocumentPosition(right.element);
      if (position & left.element.DOCUMENT_POSITION_DISCONNECTED) return 0;
      return position & left.element.DOCUMENT_POSITION_FOLLOWING ? -1
        : position & left.element.DOCUMENT_POSITION_PRECEDING ? 1 : 0;
    }), []);
  const refresh = useCallback(() => {
    const next = orderedItems();
    setItems((previous) => previous.length === next.length && previous.every((item, index) =>
      item.value === next[index]!.value && item.element === next[index]!.element && item.disabled === next[index]!.disabled)
      ? previous : next);
    const container = root.current;
    const previousFocus = focused.current;
    if (!container || !previousFocus || navigation !== 'roving') return;
    if (next.some((item) => item.element === previousFocus && !item.disabled)) return;
    focused.current = null;
    const active = container.ownerDocument.activeElement;
    if (active !== previousFocus && active !== container.ownerDocument.body && active !== container.ownerDocument.documentElement) return;
    (next.find((item) => !item.disabled)?.element ?? container).focus();
  }, [orderedItems, root, navigation]);
  useCommitEffect(refresh);
  useCommitEffect(() => {
    const container = root.current;
    if (!container) return;
    if (navigation === 'native') focused.current = null;
    const observer = new MutationObserver(refresh);
    observer.observe(container, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled'] });
    for (let ancestor = container.parentElement; ancestor; ancestor = ancestor.parentElement) {
      if (ancestor.tagName === 'FIELDSET') observer.observe(ancestor, { attributes: true, attributeFilter: ['disabled'] });
    }
    return () => observer.disconnect();
  }, [root, navigation, refresh]);
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
  const markFocused = useCallback((value: string) => { focused.current = entries.current.get(value)?.element ?? null; }, []);
  const handleBlur = useCallback((event: FocusEvent<HTMLDivElement>) => {
    if (event.relatedTarget) {
      if (event.relatedTarget !== focused.current) focused.current = null;
      return;
    }
    queueMicrotask(() => {
      const element = focused.current;
      if (element?.isConnected && !element.matches(':disabled') && element.ownerDocument.activeElement !== element) focused.current = null;
    });
  }, []);
  return { items, register, orderedItems, markFocused, handleBlur };
}
