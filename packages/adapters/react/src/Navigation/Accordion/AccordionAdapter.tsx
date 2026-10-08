import { useId } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { AccordionItemContext, AccordionRootContext } from './AccordionContext.tsx';
import { AccordionItemAdapter } from './AccordionItemAdapter.tsx';
import { AccordionTriggerAdapter } from './AccordionTriggerAdapter.tsx';
import { AccordionPanelAdapter } from './AccordionPanelAdapter.tsx';
import { useAccordion } from './useAccordion.ts';
import type { UseAccordionOptions } from './useAccordion.ts';
import { useAccordionItems } from './useAccordionItems.ts';

export type AccordionAdapterProps = Omit<
  ComponentPropsWithRef<'div'>,
  'defaultValue' | 'onChange' | 'children'
> &
  UseAccordionOptions & { children: ReactNode };

function AccordionRootAdapter(props: AccordionAdapterProps) {
  const selection = useAccordion(props);
  const rootId = useId();
  const registerItem = useAccordionItems(selection.value);
  const { children, value, defaultValue, multiple, onValueChange, ref, ...rootProps } = props;

  const isOpen = (itemValue: string) =>
    Array.isArray(selection.value)
      ? selection.value.includes(itemValue)
      : selection.value === itemValue;

  return (
    <AccordionRootContext.Provider
      value={{ rootId, isOpen, toggle: selection.toggle, registerItem }}
    >
      <AccordionItemContext.Provider value={null}>
        <div {...rootProps} ref={ref} data-ui="accordion">
          {children}
        </div>
      </AccordionItemContext.Provider>
    </AccordionRootContext.Provider>
  );
}

export const AccordionAdapter = Object.assign(AccordionRootAdapter, {
  Item: AccordionItemAdapter,
  Trigger: AccordionTriggerAdapter,
  Panel: AccordionPanelAdapter,
});
