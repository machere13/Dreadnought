import { useCallback, useLayoutEffect, useRef } from 'react';
import type { ComponentPropsWithRef, MouseEvent, ReactNode } from 'react';
import { useAccordionItemContext } from './AccordionContext.tsx';
import { forwardAccordionRef } from './forwardAccordionRef.ts';

export type AccordionTriggerAdapterProps = Omit<ComponentPropsWithRef<'button'>,
  'id' | 'type' | 'aria-controls' | 'aria-expanded' | 'children'> & {
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
};

export function AccordionTriggerAdapter({ headingLevel = 3, children, onClick, ref, ...buttonProps }: AccordionTriggerAdapterProps) {
  const item = useAccordionItemContext();
  const token = useRef(Symbol('accordion-trigger'));
  useLayoutEffect(() => item.registerPart('trigger', token.current), [item.registerPart]);
  const Heading = `h${headingLevel}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  const setRef = useCallback((element: HTMLButtonElement | null) =>
    forwardAccordionRef(item.triggerRef, ref, element), [item.triggerRef, ref]);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (!event.defaultPrevented && !buttonProps.disabled) item.toggle();
  }

  return <Heading><button {...item.disclosure.triggerProps} {...buttonProps} ref={setRef}
    data-state={item.open ? 'open' : 'closed'} onClick={handleClick}>{children}</button></Heading>;
}
