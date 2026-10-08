import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { AccordionValue } from '@dreadnought/core';

export function useAccordionItems(selectedValue: AccordionValue) {
  const items = useRef(new Map<string, symbol>());
  const mounted = useRef(false);
  const [, revalidate] = useState(0);

  const registerItem = useCallback((value: string, token: symbol) => {
    if (!value || items.current.has(value)) {
      throw new Error(`Duplicate or empty Accordion.Item value: ${value}`);
    }
    items.current.set(value, token);
    if (mounted.current) {
      revalidate((revision) => revision + 1);
    }
    return () => {
      if (items.current.get(value) === token) {
        items.current.delete(value);
        if (mounted.current) {
          revalidate((revision) => revision + 1);
        }
      }
    };
  }, []);

  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useLayoutEffect(() => {
    const selected = Array.isArray(selectedValue)
      ? selectedValue
      : selectedValue === null
        ? []
        : [selectedValue];
    if (
      new Set(selected).size !== selected.length ||
      selected.some((value) => !value || !items.current.has(value))
    ) {
      throw new Error('Accordion value must reference unique existing items.');
    }
  });

  return registerItem;
}
