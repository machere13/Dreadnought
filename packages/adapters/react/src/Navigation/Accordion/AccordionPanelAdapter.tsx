import { useLayoutEffect, useRef } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { useAccordionItemContext } from './AccordionContext.tsx';

export type AccordionPanelAdapterProps = Omit<ComponentPropsWithRef<'div'>,
  'id' | 'aria-labelledby' | 'hidden' | 'children'> & { children: ReactNode };

export function AccordionPanelAdapter({ children, ref, ...panelProps }: AccordionPanelAdapterProps) {
  const item = useAccordionItemContext();
  const token = useRef(Symbol('accordion-panel'));
  useLayoutEffect(() => item.registerPart('panel', token.current), [item.registerPart]);

  return <div {...panelProps} ref={(element) => {
    item.panelRef.current = element;
    if (typeof ref === 'function') ref(element);
    else if (ref) ref.current = element;
  }} id={item.panelId} aria-labelledby={item.triggerId} hidden={!item.open}>{children}</div>;
}
