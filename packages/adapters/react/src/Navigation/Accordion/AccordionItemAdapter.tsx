import { useLayoutEffect, useRef } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { AccordionItemContext, useAccordionRootContext } from './AccordionContext.tsx';
import { useAccordionParts } from './useAccordionParts.ts';

export type AccordionItemAdapterProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  value: string;
  children: ReactNode;
};

export function AccordionItemAdapter({ value, children, ref, ...itemProps }: AccordionItemAdapterProps) {
  const root = useAccordionRootContext();
  const itemToken = useRef(Symbol('accordion-item'));
  const registerPart = useAccordionParts(value);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const open = root.isOpen(value);
  const wasOpen = useRef(open);

  useLayoutEffect(() => root.registerItem(value, itemToken.current), [root.registerItem, value]);
  useLayoutEffect(() => {
    if (wasOpen.current && !open && panelRef.current?.contains(document.activeElement)) {
      triggerRef.current?.focus();
    }
    wasOpen.current = open;
  }, [open]);

  const encodedValue = encodeURIComponent(value);
  const context = {
    value,
    open,
    triggerId: `${root.rootId}-trigger-${encodedValue}`,
    panelId: `${root.rootId}-panel-${encodedValue}`,
    toggle: () => root.toggle(value),
    triggerRef,
    panelRef,
    registerPart,
  };

  return <AccordionItemContext.Provider value={context}>
    <div {...itemProps} ref={ref} data-state={open ? 'open' : 'closed'}>{children}</div>
  </AccordionItemContext.Provider>;
}
