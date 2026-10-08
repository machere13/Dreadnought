import { useLayoutEffect, useRef } from 'react';
import { MenuAdapter } from '../Menu/index.ts';
import type { MenuAdapterProps } from '../Menu/index.ts';
import { usePopover } from '../../Overlays/Popover/index.ts';
import type { PopoverAdapterProps } from '../../Overlays/Popover/index.ts';

export type DropdownAdapterProps = Omit<PopoverAdapterProps, 'content'> &
  Pick<MenuAdapterProps, 'items' | 'selectedValue' | 'onAction'> & {
    menuProps?: Omit<MenuAdapterProps, 'items' | 'selectedValue' | 'onAction' | 'id'>;
  };

export function DropdownAdapter({
  items,
  selectedValue,
  onAction,
  menuProps = {},
  children,
  open,
  defaultOpen,
  disabled,
  onOpenChange,
  placement = 'bottomLeft',
  arrow = false,
  autoAdjustOverflow = true,
  style,
  'aria-label': label,
  'aria-labelledby': labelledBy,
  ...native
}: DropdownAdapterProps) {
  const popover = usePopover({
    open,
    defaultOpen,
    disabled,
    onOpenChange,
    placement,
    arrow,
    autoAdjustOverflow,
  });
  const edge = useRef<'first' | 'last' | undefined>(undefined);
  const menuId = `${popover.contentProps.id}-menu`;
  function focusEdge() {
    const menu = popover.contentProps.ref.current?.querySelector<HTMLElement>('[role="menu"]');
    const buttons = menu?.querySelectorAll<HTMLElement>(
      '[data-menu-value]:not([aria-disabled="true"])',
    );
    (buttons?.[edge.current === 'last' ? buttons.length - 1 : 0] ?? menu)?.focus({
      preventScroll: true,
    });
    revealFocus();
  }
  function revealFocus() {
    const menu = popover.contentProps.ref.current?.querySelector<HTMLElement>('[role="menu"]');
    const active = menu?.ownerDocument.activeElement;
    if (!menu || !active || !menu.contains(active) || active === menu) {
      return;
    }
    const bounds = menu.getBoundingClientRect();
    const item = active.getBoundingClientRect();
    const top = bounds.top + menu.clientTop;
    const bottom = top + menu.clientHeight;
    if (item.top < top) {
      menu.scrollTop += item.top - top;
    } else if (item.bottom > bottom) {
      menu.scrollTop += item.bottom - bottom;
    }
  }
  useLayoutEffect(() => {
    const popup = popover.contentProps.ref.current;
    if (popover.open) {
      if (edge.current || popup?.ownerDocument.activeElement === popup) {
        focusEdge();
      } else {
        revealFocus();
      }
    }
    edge.current = undefined;
  }, [popover.open]);
  const menuLabel = menuProps['aria-label'] ?? label;
  return (
    <>
      {children({
        ...popover.triggerProps,
        'aria-haspopup': 'menu',
        'aria-controls': menuId,
        onClick: (event) => {
          edge.current = undefined;
          popover.triggerProps.onClick?.(event);
        },
        onKeyDown: (event) => {
          if (
            event.defaultPrevented ||
            event.nativeEvent.isComposing ||
            disabled ||
            !['ArrowDown', 'ArrowUp'].includes(event.key)
          ) {
            return;
          }
          event.preventDefault();
          edge.current = event.key === 'ArrowUp' ? 'last' : 'first';
          if (popover.open) {
            focusEdge();
          } else {
            popover.show();
          }
        },
      })}
      {popover.open && (
        <div
          {...native}
          {...popover.contentProps}
          role={undefined}
          aria-modal={undefined}
          aria-labelledby={undefined}
          popover="manual"
          data-ui="dropdown"
          style={{ position: 'fixed', inset: 'auto', margin: 0, ...style }}
        >
          {arrow !== false && <span data-ui="popover-arrow" aria-hidden="true" />}
          <MenuAdapter
            tabIndex={-1}
            {...menuProps}
            id={menuId}
            items={items}
            selectedValue={selectedValue}
            aria-label={menuLabel}
            aria-labelledby={
              menuProps['aria-labelledby'] ??
              labelledBy ??
              (menuLabel ? undefined : popover.triggerProps.id)
            }
            onAction={(value) => {
              onAction?.(value);
              popover.close();
            }}
          />
        </div>
      )}
    </>
  );
}
