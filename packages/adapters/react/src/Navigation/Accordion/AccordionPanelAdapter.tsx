import { useCallback, useLayoutEffect, useRef } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import type { ContentMountPolicy } from '@dreadnought/core';
import { useContentMount } from '../../shared/useContentMount.ts';
import { useAccordionItemContext } from './AccordionContext.tsx';
import { forwardAccordionRef } from './forwardAccordionRef.ts';

export type AccordionPanelAdapterProps = Omit<
  ComponentPropsWithRef<'div'>,
  'id' | 'aria-labelledby' | 'hidden' | 'children'
> & { children: ReactNode; mountPolicy?: ContentMountPolicy };

export function AccordionPanelAdapter({
  children,
  mountPolicy = 'eager',
  ref,
  ...panelProps
}: AccordionPanelAdapterProps) {
  const item = useAccordionItemContext();
  const mounted = useContentMount(item.open, mountPolicy);
  const token = useRef(Symbol('accordion-panel'));
  useLayoutEffect(() => item.registerPart('panel', token.current), [item.registerPart]);
  const setRef = useCallback(
    (element: HTMLDivElement | null) => forwardAccordionRef(item.panelRef, ref, element),
    [item.panelRef, ref],
  );

  return (
    <div {...panelProps} {...item.disclosure.panelProps} ref={setRef}>
      {mounted ? children : null}
    </div>
  );
}
