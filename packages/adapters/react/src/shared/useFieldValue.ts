import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

export function useFieldValue<T>(value: T | undefined, defaultValue: T, onValueChange: ((value: T) => void) | undefined,
  ref: RefObject<HTMLInputElement | HTMLSelectElement | HTMLFieldSetElement | null>, formId?: string) {
  const [internal, setInternal] = useState(defaultValue);
  useEffect(() => {
    const form = ref.current?.form;
    function reset(event: Event) {
      queueMicrotask(() => {
        if (value === undefined && !event.defaultPrevented) setInternal(defaultValue);
      });
    }
    form?.addEventListener('reset', reset);
    return () => form?.removeEventListener('reset', reset);
  }, [value, defaultValue, ref, formId]);
  return [value === undefined ? internal : value, (next: T) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  }] as const;
}
