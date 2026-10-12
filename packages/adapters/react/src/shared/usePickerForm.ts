import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { flushSync } from 'react-dom';

interface PickerFormOptions {
  form?: string;
  isDirty(): boolean;
  confirm(): void;
  reset(): void;
}

export function usePickerForm(
  input: RefObject<HTMLInputElement | null>,
  root: RefObject<HTMLElement | null>,
  options: PickerFormOptions,
): void {
  const current = useRef(options);
  current.current = options;
  useEffect(() => {
    const doc = input.current?.ownerDocument;
    const events = doc?.defaultView ?? doc;
    const submit = (event: Event) => {
      if (event.target !== input.current?.form || event.defaultPrevented) return;
      if (current.current.isDirty()) flushSync(() => current.current.confirm());
    };
    const reset = (event: Event) => {
      const form = input.current?.form;
      if (event.target !== form) return;
      queueMicrotask(() => {
        if (!event.defaultPrevented && root.current && input.current?.form === form) {
          current.current.reset();
        }
      });
    };
    events?.addEventListener('submit', submit, true);
    events?.addEventListener('reset', reset, true);
    return () => {
      events?.removeEventListener('submit', submit, true);
      events?.removeEventListener('reset', reset, true);
    };
  }, [input, root, options.form]);
}
