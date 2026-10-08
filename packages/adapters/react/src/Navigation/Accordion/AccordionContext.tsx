import { createContext, useContext } from 'react';
import type { RefObject } from 'react';
import type { DisclosureState } from '@dreadnought/core';

export interface AccordionRootContextValue {
  rootId: string;
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
  registerItem: (value: string, token: symbol) => () => void;
}

export interface AccordionItemContextValue {
  value: string;
  open: boolean;
  disclosure: DisclosureState;
  toggle: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  panelRef: RefObject<HTMLDivElement | null>;
  registerPart: (part: 'trigger' | 'panel', token: symbol) => () => void;
}

export const AccordionRootContext = createContext<AccordionRootContextValue | null>(null);
export const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

export function useAccordionRootContext(): AccordionRootContextValue {
  const context = useContext(AccordionRootContext);
  if (!context) {
    throw new Error('Accordion.Item must be inside Accordion.');
  }
  return context;
}

export function useAccordionItemContext(): AccordionItemContextValue {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error('Accordion.Trigger and Accordion.Panel must be inside Accordion.Item.');
  }
  return context;
}
