import type { NavigationDirection } from './getNextEnabledValue.ts';
import { getNavigationDirection } from './getNavigationDirection.ts';

export interface ComboboxKeyOptions {
  open: boolean;
  searchable?: boolean;
  openOnEnter?: boolean;
}
export type ComboboxKeyAction =
  | { type: 'open'; preventDefault: true }
  | { type: 'select'; preventDefault: true }
  | { type: 'close'; preventDefault: boolean }
  | { type: 'navigate'; direction: NavigationDirection; preventDefault: true };

export function getComboboxKeyAction(
  key: string,
  options: ComboboxKeyOptions,
): ComboboxKeyAction | undefined {
  const { open, searchable = true, openOnEnter = true } = options;
  if (key === 'Escape') {
    return open ? { type: 'close', preventDefault: true } : undefined;
  }
  if (key === 'Tab') {
    return { type: 'close', preventDefault: false };
  }
  if ((key === 'Enter' && (open || openOnEnter)) || (key === ' ' && !searchable)) {
    return { type: open ? 'select' : 'open', preventDefault: true };
  }
  const direction = getNavigationDirection(key, { homeEnd: !searchable });
  return direction ? { type: 'navigate', direction, preventDefault: true } : undefined;
}
