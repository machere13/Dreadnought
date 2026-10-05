import { createContext, useContext } from 'react';
import type { NavigationDirection, ToolbarCoreOptions } from '@dreadnought/core';

export interface RegisteredToolbarItem {
  value: string;
  disabled: boolean;
  element: HTMLElement;
}

export interface ToolbarContextValue {
  navigation: NonNullable<ToolbarCoreOptions['navigation']>;
  orientation: NonNullable<ToolbarCoreOptions['orientation']>;
  loop: boolean;
  tabStopValue: string | undefined;
  register: (item: RegisteredToolbarItem) => () => void;
  activate: (value: string) => void;
  navigate: (value: string, direction: NavigationDirection) => void;
}

export const ToolbarContext = createContext<ToolbarContextValue | null>(null);

export function useToolbarContext(): ToolbarContextValue {
  const context = useContext(ToolbarContext);
  if (!context) throw new Error('useToolbarItem must be inside ToolbarAdapter or Toolbar.');
  return context;
}
