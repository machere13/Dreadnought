import {
  AccordionAdapter,
  AccordionItemAdapter,
  AccordionTriggerAdapter,
  AccordionPanelAdapter,
} from '@dreadnought/react/unstyled';
import type {
  AccordionAdapterProps,
  AccordionItemAdapterProps,
  AccordionTriggerAdapterProps,
  AccordionPanelAdapterProps,
} from '@dreadnought/react/unstyled';
import { accordionPresentation } from '#presentation/Navigation/Accordion/accordionPresentation.ts';
import { Icon } from '../../DataDisplay/Icon/Icon.tsx';

function classes(library: string, consumer?: string) {
  return [library, consumer].filter(Boolean).join(' ');
}

function AccordionRoot({ className, ...props }: AccordionAdapterProps) {
  return <AccordionAdapter {...props} className={classes(accordionPresentation.root, className)} />;
}

function Item({ className, ...props }: AccordionItemAdapterProps) {
  return <AccordionItemAdapter {...props} className={classes(accordionPresentation.item, className)} />;
}

function Trigger({ className, children, ...props }: AccordionTriggerAdapterProps) {
  return <AccordionTriggerAdapter {...props} className={classes(accordionPresentation.trigger, className)}>
    {children}<Icon name="down" className={accordionPresentation.indicator} aria-hidden="true" />
  </AccordionTriggerAdapter>;
}

function Panel({ className, ...props }: AccordionPanelAdapterProps) {
  return <AccordionPanelAdapter {...props} className={classes(accordionPresentation.panel, className)} />;
}

export const Accordion = Object.assign(AccordionRoot, { Item, Trigger, Panel });
export type AccordionProps = AccordionAdapterProps;
