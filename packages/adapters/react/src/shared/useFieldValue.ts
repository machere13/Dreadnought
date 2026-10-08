import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

export function useFieldValue<T>(
  value: T | undefined,
  defaultValue: T,
  onValueChange: ((value: T) => void) | undefined,
  ref: RefObject<HTMLInputElement | HTMLSelectElement | HTMLFieldSetElement | null>,
  formId?: string,
) {
  const [internal, setInternal] = useState(defaultValue);
  useEffect(() => {
    const document = ref.current?.ownerDocument;
    let attached = true;
    function reset(event: Event) {
      const owner = ref.current?.form;
      if (!owner || event.target !== owner) {
        return;
      }
      queueMicrotask(() => {
        if (
          attached &&
          ref.current?.form === owner &&
          value === undefined &&
          !event.defaultPrevented
        ) {
          setInternal(defaultValue);
        }
      });
    }
    document?.addEventListener('reset', reset, true);
    return () => {
      attached = false;
      document?.removeEventListener('reset', reset, true);
    };
  }, [value, defaultValue, ref, formId]);
  return [
    value === undefined ? internal : value,
    (next: T) => {
      if (value === undefined) {
        setInternal(next);
      }
      onValueChange?.(next);
    },
  ] as const;
}
