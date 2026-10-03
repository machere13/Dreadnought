import { useState } from 'react';
import type { ComponentPropsWithRef, ComponentPropsWithoutRef, ReactNode } from 'react';
import { getNextEnabledValue } from '@dreadnought/core';
import type { NavigationItem } from '@dreadnought/core';

export interface MenuItem extends NavigationItem {
  label: ReactNode;
  ariaLabel?: string;
}

export type MenuAdapterProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  items: readonly MenuItem[];
  /** When supplied, items are radio menu items with this value checked. */
  selectedValue?: string;
  onAction?: (value: string) => void;
  slotProps?: { item?: ComponentPropsWithoutRef<'button'> };
};

export function MenuAdapter({ items, selectedValue, onAction, slotProps = {}, onKeyDown, ref, ...props }: MenuAdapterProps) {
  const [focusedValue, setFocusedValue] = useState(selectedValue);
  const values = new Set(items.map((item) => item.value));
  if (values.size !== items.length || values.has('')) throw new Error('Menu item values must be nonempty and unique.');
  const tabStop = items.find((item) => !item.disabled && item.value === focusedValue)?.value
    ?? items.find((item) => !item.disabled && item.value === selectedValue)?.value
    ?? items.find((item) => !item.disabled)?.value;

  return <div data-ui="menu" data-slot="menu" {...props} ref={ref} role="menu" onKeyDown={(event) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const directions = { ArrowDown: 'next', ArrowUp: 'previous', Home: 'first', End: 'last' } as const;
    const direction = directions[event.key as keyof typeof directions];
    if (!direction) return;
    event.preventDefault();
    const current = document.activeElement?.getAttribute('data-menu-value') ?? tabStop ?? '';
    const next = getNextEnabledValue(items, current, direction);
    const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('[data-menu-value]');
    [...buttons].find((button) => button.getAttribute('data-menu-value') === next)?.focus();
  }}>
    {items.map((item) => <button {...slotProps.item} key={item.value} type="button"
      role={selectedValue === undefined ? 'menuitem' : 'menuitemradio'}
      data-slot="menu-item" data-menu-value={item.value}
      aria-checked={selectedValue === undefined ? undefined : selectedValue === item.value}
      aria-label={item.ariaLabel} disabled={item.disabled} tabIndex={item.value === tabStop ? 0 : -1}
      onFocus={(event) => {
        slotProps.item?.onFocus?.(event);
        if (!event.defaultPrevented) setFocusedValue(item.value);
      }} onClick={(event) => {
        slotProps.item?.onClick?.(event);
        if (event.defaultPrevented || item.disabled) return;
        event.currentTarget.focus();
        onAction?.(item.value);
      }}>{item.label}</button>)}
  </div>;
}
