import { useCallback } from 'react';
import type { FocusEventHandler, KeyboardEventHandler, Ref, RefCallback } from 'react';
import { attachRef } from '../../shared/attachRef.ts';
import { useToolbarContext } from './ToolbarContext.ts';

export interface UseToolbarItemOptions<T extends HTMLElement = HTMLButtonElement> {
  value: string;
  disabled?: boolean;
  ref?: Ref<T>;
  onFocus?: FocusEventHandler<T>;
  onKeyDown?: KeyboardEventHandler<T>;
}

export interface ToolbarItemProps<T extends HTMLElement = HTMLButtonElement> {
  ref: RefCallback<T>;
  tabIndex?: number;
  onFocus: FocusEventHandler<T>;
  onKeyDown: KeyboardEventHandler<T>;
}

export function useToolbarItem<T extends HTMLElement = HTMLButtonElement>({ value, disabled = false, ref, onFocus, onKeyDown }: UseToolbarItemOptions<T>): { itemProps: ToolbarItemProps<T> } {
  const { register, activate, navigation, tabStopValue } = useToolbarContext();
  const itemRef = useCallback((element: T | null) => {
    if (!element) return;
    return attachRef(element, ref, register({ value, disabled, element }));
  }, [register, value, disabled, ref]);
  return {
    itemProps: {
      ref: itemRef,
      ...(navigation === 'native' ? {} : { tabIndex: tabStopValue === value ? 0 : -1 }),
      onFocus(event) {
        onFocus?.(event);
        if (!event.defaultPrevented && event.target === event.currentTarget) activate(value);
      },
      onKeyDown(event) { onKeyDown?.(event); },
    },
  };
}
