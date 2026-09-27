import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { AccordionItemContext, useAccordionRootContext } from './AccordionContext.tsx';

export type AccordionItemAdapterProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  value: string;
  children: ReactNode;
};

export function AccordionItemAdapter({ value, children, ref, ...itemProps }: AccordionItemAdapterProps) {
  const root = useAccordionRootContext();
  const itemToken = useRef(Symbol('accordion-item'));
  const triggerTokens = useRef(new Set<symbol>());
  const panelTokens = useRef(new Set<symbol>());
  const mounted = useRef(false);
  const [, setRevision] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const open = root.isOpen(value);
  const wasOpen = useRef(open);

  const registerPart = useCallback((part: 'trigger' | 'panel', token: symbol) => {
    const tokens = part === 'trigger' ? triggerTokens.current : panelTokens.current;
    tokens.add(token);
    if (mounted.current) setRevision((revision) => revision + 1);
    return () => {
      tokens.delete(token);
      if (mounted.current) setRevision((revision) => revision + 1);
    };
  }, []);

  useLayoutEffect(() => root.registerItem(value, itemToken.current), [root.registerItem, value]);
  useLayoutEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useLayoutEffect(() => {
    if (triggerTokens.current.size !== 1 || panelTokens.current.size !== 1) {
      throw new Error(`Accordion.Item ${value} needs exactly one Trigger and one Panel.`);
    }
  });
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
