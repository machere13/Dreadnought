import { useLayoutEffect, useRef } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { getDisclosureState } from '@dreadnought/core';
import { AccordionItemContext, useAccordionRootContext } from './AccordionContext.tsx';
import { useAccordionParts } from './useAccordionParts.ts';

export type AccordionItemAdapterProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  value: string;
  children: ReactNode;
};

export function AccordionItemAdapter({
  value,
  children,
  ref,
  ...itemProps
}: AccordionItemAdapterProps) {
  const root = useAccordionRootContext();
  const itemToken = useRef(Symbol('accordion-item'));
  const registerPart = useAccordionParts(value);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const open = root.isOpen(value);
  const wasOpen = useRef(open);

  useLayoutEffect(() => root.registerItem(value, itemToken.current), [root.registerItem, value]);
  useLayoutEffect(() => {
    const panel = panelRef.current;
    let active = panel?.ownerDocument.activeElement;
    for (
      let frame = panel?.ownerDocument.defaultView?.frameElement;
      frame;
      frame = frame.ownerDocument.defaultView?.frameElement
    ) {
      if (frame.ownerDocument.activeElement !== frame) {
        active = null;
      }
    }
    if (wasOpen.current && !open && active && panel?.contains(active)) {
      triggerRef.current?.focus();
    }
    wasOpen.current = open;
  }, [open]);

  const encodedValue = encodeURIComponent(value);
  const disclosure = getDisclosureState({
    open,
    triggerId: `${root.rootId}-trigger-${encodedValue}`,
    panelId: `${root.rootId}-panel-${encodedValue}`,
  });
  const context = {
    value,
    open,
    disclosure,
    toggle: () => root.toggle(value),
    triggerRef,
    panelRef,
    registerPart,
  };

  return (
    <AccordionItemContext.Provider value={context}>
      <div {...itemProps} ref={ref} data-state={open ? 'open' : 'closed'}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}
