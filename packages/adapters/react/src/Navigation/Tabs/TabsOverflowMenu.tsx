import { useId, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useTabsContext } from './TabsContext.tsx';
import type { RegisteredTab } from './TabsContext.tsx';
import type { TabsListAdapterProps } from './TabsListAdapter.tsx';
import { MenuAdapter } from '../Menu/MenuAdapter.tsx';

export function TabsOverflowMenu({ tabs, revealTab, label, slotProps }: {
  tabs: RegisteredTab[];
  revealTab: (element: HTMLButtonElement) => void;
  label: string;
  slotProps: NonNullable<TabsListAdapterProps['slotProps']>;
}) {
  const context = useTabsContext();
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const focusLast = useRef(false);
  const [open, setOpen] = useState(false);

  function close(restoreFocus = false) {
    if (menuRef.current?.matches(':popover-open')) menuRef.current.hidePopover();
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }

  useLayoutEffect(() => {
    if (!open) return;
    const menu = menuRef.current!;
    const view = menu.ownerDocument.defaultView;
    Reflect.apply(menu.showPopover, menu, [{ source: triggerRef.current ?? undefined }]);
    function position() {
      const trigger = triggerRef.current!.getBoundingClientRect();
      const popup = menu.getBoundingClientRect();
      const width = menu.ownerDocument.documentElement.clientWidth;
      const height = menu.ownerDocument.documentElement.clientHeight;
      menu.style.left = `${Math.max(0, Math.min(trigger.right - popup.width, width - popup.width))}px`;
      menu.style.top = `${Math.max(0, trigger.bottom + popup.height <= height ? trigger.bottom : trigger.top - popup.height)}px`;
    }
    position();
    const items = menu.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]:not(:disabled)');
    (focusLast.current ? items[items.length - 1] : items[0])?.focus();
    const resize = view?.ResizeObserver ? new view.ResizeObserver(position) : undefined;
    resize?.observe(menu);
    view?.addEventListener('resize', position);
    view?.addEventListener('scroll', position, true);
    return () => {
      resize?.disconnect();
      view?.removeEventListener('resize', position);
      view?.removeEventListener('scroll', position, true);
      if (menu.matches(':popover-open')) menu.hidePopover();
    };
  }, [open]);

  function navigateMenu(event: KeyboardEvent<HTMLDivElement>) {
    slotProps.menu?.onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === 'Escape') { event.preventDefault(); close(true); return; }
  }

  return <>
    <button {...slotProps.more} ref={triggerRef} type="button" data-slot="more"
      popoverTarget={menuId}
      aria-label={label} aria-haspopup="menu" aria-expanded={open} aria-controls={menuId}
      onClick={(event) => {
        slotProps.more?.onClick?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        focusLast.current = false;
        if (open) close(); else setOpen(true);
      }} onKeyDown={(event) => {
        slotProps.more?.onKeyDown?.(event);
        if (event.defaultPrevented || !['ArrowDown', 'ArrowUp'].includes(event.key)) return;
        event.preventDefault();
        focusLast.current = event.key === 'ArrowUp';
        setOpen(true);
      }}>{slotProps.more?.children ?? '…'}</button>
    <MenuAdapter {...slotProps.menu} ref={menuRef} id={menuId} popover="auto" hidden={!open}
      items={tabs.map((tab) => ({ value: tab.value, label: tab.label, disabled: tab.disabled,
        ariaLabel: tab.element.getAttribute('aria-label') ?? undefined }))}
      selectedValue={context.value} slotProps={{ item: slotProps.item }} onAction={(value) => {
        const tab = tabs.find((tab) => tab.value === value)!;
        close();
        context.setValue(value);
        revealTab(tab.element);
        tab.element.focus({ preventScroll: true });
      }}
      role="menu" aria-label={label} data-slot="more-menu" onKeyDown={navigateMenu}
      onToggle={(event) => {
        slotProps.menu?.onToggle?.(event);
        if (event.newState === 'closed') setOpen(false);
      }} onBlur={(event) => {
        slotProps.menu?.onBlur?.(event);
        if (!event.defaultPrevented && event.relatedTarget !== triggerRef.current
          && !event.currentTarget.contains(event.relatedTarget)) close();
      }} />
  </>;
}
