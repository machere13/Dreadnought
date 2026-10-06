import { useCallback } from 'react';
import { getNavigationDirection } from '@dreadnought/core';
import type { ComponentPropsWithRef, KeyboardEvent } from 'react';
import { useTabsContext } from './TabsContext.tsx';
import { forwardTabsRef } from './forwardTabsRef.ts';

export type TabsTabAdapterProps = Omit<ComponentPropsWithRef<'button'>, 'value' | 'type'> & {
  value: string;
};

export function TabsTabAdapter({ value, disabled = false, onClick, onKeyDown, ref, children, ...props }: TabsTabAdapterProps) {
  const context = useTabsContext();
  const setRef = useCallback((element: HTMLButtonElement | null) => {
    context.registerTab(value, element, disabled, children);
    return forwardTabsRef(element, ref, () => context.registerTab(value, null, disabled, children));
  }, [context.registerTab, children, disabled, ref, value]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.nativeEvent.isComposing) return;
    const targetDirection = getNavigationDirection(event.key, { orientation: 'horizontal' });
    if (targetDirection === undefined) return;
    event.preventDefault();
    context.navigate(value, targetDirection);
  }

  return <button {...props} ref={setRef} type="button" role="tab" data-slot="tab"
    id={context.tabId(value)} aria-controls={context.panelId(value)}
    aria-selected={context.value === value} tabIndex={context.value === value ? 0 : -1}
    disabled={disabled} onClick={(event) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      event.currentTarget.focus();
      context.setValue(value);
    }}
    onKeyDown={handleKeyDown}>{children}</button>;
}
