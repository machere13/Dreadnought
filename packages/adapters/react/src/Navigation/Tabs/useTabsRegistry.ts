import { useCallback, useLayoutEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { RegisteredTab } from './TabsContext.tsx';

export function useTabsRegistry(selectedValue: string) {
  const tabs = useRef(new Map<string, RegisteredTab>());
  const panels = useRef(new Map<string, HTMLDivElement>());

  const registerTab = useCallback((value: string, element: HTMLButtonElement | null, disabled: boolean, label: ReactNode) => {
    if (element === null) {
      tabs.current.delete(value);
      return;
    }
    if (value.length === 0 || (tabs.current.has(value) && tabs.current.get(value)?.element !== element)) {
      throw new Error(`Duplicate or empty Tabs.Tab value: ${value}`);
    }
    tabs.current.set(value, { value, disabled, element, label });
  }, []);

  const registerPanel = useCallback((value: string, element: HTMLDivElement | null) => {
    if (element === null) {
      panels.current.delete(value);
      return;
    }
    if (value.length === 0 || (panels.current.has(value) && panels.current.get(value) !== element)) {
      throw new Error(`Duplicate or empty Tabs.Panel value: ${value}`);
    }
    panels.current.set(value, element);
  }, []);

  const orderedTabs = useCallback(() => [...tabs.current.values()].sort((a, b) => {
    const relation = a.element.compareDocumentPosition(b.element);
    if (relation & Node.DOCUMENT_POSITION_DISCONNECTED) return 0;
    if (relation & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (relation & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  }), []);

  const getTab = useCallback((value: string) => tabs.current.get(value), []);

  useLayoutEffect(() => {
    if (tabs.current.size !== panels.current.size) {
      throw new Error('Every Tabs.Tab needs one matching Tabs.Panel.');
    }
    for (const [value] of tabs.current) {
      if (!panels.current.has(value)) throw new Error(`Missing Tabs.Panel for ${value}.`);
    }
    const selected = tabs.current.get(selectedValue);
    if (!selected || selected.disabled) throw new Error(`Invalid selected Tabs value: ${selectedValue}.`);
  });

  return { registerTab, registerPanel, orderedTabs, getTab };
}
