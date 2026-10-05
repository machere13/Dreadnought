import type { NavigationDirection } from './getNextEnabledValue.ts';

export interface NavigationKeyOptions {
  orientation?: 'horizontal' | 'vertical';
  homeEnd?: boolean;
}

export function getNavigationDirection(key: string, options: NavigationKeyOptions = {}): NavigationDirection | undefined {
  const { orientation = 'vertical', homeEnd = true } = options;
  if (homeEnd && key === 'Home') return 'first';
  if (homeEnd && key === 'End') return 'last';
  if (key === (orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp')) return 'previous';
  if (key === (orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown')) return 'next';
  return undefined;
}
