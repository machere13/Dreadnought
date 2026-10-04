import { useRef, useState } from 'react';
import type { ComponentPropsWithRef, ComponentPropsWithoutRef, ReactNode } from 'react';
import { getNextEnabledValue, getTypeaheadValue } from '@dreadnought/core';
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

export function MenuAdapter({ items, selectedValue, onAction, slotProps = {}, onKeyDown, onBlur, ref, ...props }: MenuAdapterProps) {
  const [focusedValue, setFocusedValue] = useState(selectedValue);
  const search = useRef({ query: '', time: 0 });
  const values = new Set(items.map((item) => item.value));
  if (values.size !== items.length || values.has('')) throw new Error('Menu item values must be nonempty and unique.');
  const tabStop = items.find((item) => !item.disabled && item.value === focusedValue)?.value
    ?? items.find((item) => !item.disabled && item.value === selectedValue)?.value
    ?? items.find((item) => !item.disabled)?.value;

  return <div data-ui="menu" data-slot="menu" {...props} ref={ref} role="menu" onBlur={(event) => {
    onBlur?.(event);
    if (!event.currentTarget.contains(event.relatedTarget)) search.current.query = '';
  }} onKeyDown={(event) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const directions = { ArrowDown: 'next', ArrowUp: 'previous', Home: 'first', End: 'last' } as const;
    const direction = directions[event.key as keyof typeof directions];
    const typing = event.key.length === 1 && event.key !== ' ' && !event.ctrlKey
      && !event.altKey && !event.metaKey && !event.nativeEvent.isComposing;
    if (!direction && !typing) return;
    event.preventDefault();
    const current = event.currentTarget.ownerDocument.activeElement?.getAttribute('data-menu-value') ?? tabStop ?? '';
    const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[data-menu-value]')];
    let next: string | undefined;
    if (direction) {
      search.current.query = '';
      next = getNextEnabledValue(items, current, direction);
    } else {
      const now = Date.now();
      const key = event.key.toLowerCase();
      const previous = now - search.current.time > 500 ? '' : search.current.query;
      const query = previous === key ? key : previous + key;
      search.current = { query, time: now };
      const searchable = buttons.map(button => ({
        value: button.getAttribute('data-menu-value')!, disabled: button.disabled,
        text: button.getAttribute('aria-label') ?? button.textContent ?? '',
      }));
      next = getTypeaheadValue(searchable, current, query, { includeCurrent: query.length > 1 });
    }
    buttons.find((button) => button.getAttribute('data-menu-value') === next)?.focus();
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
