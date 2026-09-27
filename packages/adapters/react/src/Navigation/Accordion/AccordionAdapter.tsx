import { useCallback, useId, useLayoutEffect, useRef } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { AccordionRootContext } from './AccordionContext.tsx';
import { AccordionItemAdapter } from './AccordionItemAdapter.tsx';
import { AccordionTriggerAdapter } from './AccordionTriggerAdapter.tsx';
import { AccordionPanelAdapter } from './AccordionPanelAdapter.tsx';
import { useAccordion } from './useAccordion.ts';
import type { UseAccordionOptions } from './useAccordion.ts';

export type AccordionAdapterProps = Omit<ComponentPropsWithRef<'div'>, 'defaultValue' | 'onChange' | 'children'>
  & UseAccordionOptions & { children: ReactNode };

function AccordionRootAdapter(props: AccordionAdapterProps) {
  const selection = useAccordion(props);
  const rootId = useId();
  const items = useRef(new Map<string, symbol>());
  const { children, value, defaultValue, multiple, onValueChange, ref, ...rootProps } = props;

  const registerItem = useCallback((itemValue: string, token: symbol) => {
    if (!itemValue || items.current.has(itemValue)) {
      throw new Error(`Duplicate or empty Accordion.Item value: ${itemValue}`);
    }
    items.current.set(itemValue, token);
    return () => {
      if (items.current.get(itemValue) === token) items.current.delete(itemValue);
    };
  }, []);

  useLayoutEffect(() => {
    const selected = Array.isArray(selection.value) ? selection.value : selection.value === null ? [] : [selection.value];
    if (new Set(selected).size !== selected.length || selected.some((itemValue) => !itemValue || !items.current.has(itemValue))) {
      throw new Error('Accordion value must reference unique existing items.');
    }
  });

  const isOpen = (itemValue: string) => Array.isArray(selection.value)
    ? selection.value.includes(itemValue)
    : selection.value === itemValue;

  return <AccordionRootContext.Provider value={{ rootId, isOpen, toggle: selection.toggle, registerItem }}>
    <div {...rootProps} ref={ref} data-ui="accordion">{children}</div>
  </AccordionRootContext.Provider>;
}

export const AccordionAdapter = Object.assign(AccordionRootAdapter, {
  Item: AccordionItemAdapter,
  Trigger: AccordionTriggerAdapter,
  Panel: AccordionPanelAdapter,
});
