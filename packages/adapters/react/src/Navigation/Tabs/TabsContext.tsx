import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { TabDirection, TabItem } from '@dreadnought/core';

export interface RegisteredTab extends TabItem {
  element: HTMLButtonElement;
  label: ReactNode;
}

export interface TabsContextValue {
  value: string;
  setValue: (next: string) => void;
  tabId: (value: string) => string;
  panelId: (value: string) => string;
  registerTab: (
    value: string,
    element: HTMLButtonElement | null,
    disabled: boolean,
    label: ReactNode,
  ) => void;
  orderedTabs: () => RegisteredTab[];
  registerPanel: (value: string, element: HTMLDivElement | null) => void;
  navigate: (currentValue: string, direction: TabDirection) => void;
}

export const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabsContext(): TabsContextValue {
  const context = useContext(TabsContext);
  if (context === null) {
    throw new Error('Tabs parts must be inside TabsAdapter.');
  }
  return context;
}
