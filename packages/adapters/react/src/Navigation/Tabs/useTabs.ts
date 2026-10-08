import { useState } from 'react';

export type UseTabsOptions = (
  { value: string; defaultValue?: never } | { value?: never; defaultValue: string }
) & { onValueChange?: (value: string) => void };

export interface UseTabsResult {
  value: string;
  setValue: (next: string) => void;
}

export function useTabs({ value, defaultValue, onValueChange }: UseTabsOptions): UseTabsResult {
  const [internalValue, setInternalValue] = useState(defaultValue ?? value!);
  const selectedValue = value ?? internalValue;

  function setValue(next: string) {
    if (next === selectedValue) {
      return;
    }
    if (value === undefined) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  }

  return { value: selectedValue, setValue };
}
