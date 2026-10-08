import { useLayoutEffect, useRef, useState } from 'react';
import { toggleAccordionValue } from '@dreadnought/core';

type Selection<T> = ({ value: T; defaultValue?: never } | { value?: never; defaultValue?: T }) & {
  onValueChange?: (value: T) => void;
};

export type SingleAccordionOptions = Selection<string | null> & { multiple?: false };
export type MultipleAccordionOptions = Selection<string[]> & { multiple: true };
export type UseAccordionOptions = SingleAccordionOptions | MultipleAccordionOptions;

export interface UseAccordionResult<T> {
  value: T;
  toggle: (item: string) => void;
}

export function useAccordion(options: MultipleAccordionOptions): UseAccordionResult<string[]>;
export function useAccordion(options: SingleAccordionOptions): UseAccordionResult<string | null>;
export function useAccordion(
  options: UseAccordionOptions,
): UseAccordionResult<string | null | string[]>;
export function useAccordion(
  options: UseAccordionOptions,
): UseAccordionResult<string | null | string[]> {
  const [internalValue, setInternalValue] = useState<string | null | string[]>(
    () => options.defaultValue ?? options.value ?? (options.multiple ? [] : null),
  );
  const selectedValue = options.value !== undefined ? options.value : internalValue;
  const pendingValue = useRef(internalValue);
  useLayoutEffect(() => {
    pendingValue.current = internalValue;
  }, [internalValue]);

  function toggle(item: string) {
    if (options.multiple) {
      const current = (options.value ?? pendingValue.current) as string[];
      const next = toggleAccordionValue(current, item);
      if (options.value === undefined) {
        pendingValue.current = next;
        setInternalValue(next);
      }
      options.onValueChange?.(next);
    } else {
      const current = (options.value !== undefined ? options.value : pendingValue.current) as
        string | null;
      const next = toggleAccordionValue(current, item);
      if (options.value === undefined) {
        pendingValue.current = next;
        setInternalValue(next);
      }
      options.onValueChange?.(next);
    }
  }

  return { value: selectedValue, toggle };
}
