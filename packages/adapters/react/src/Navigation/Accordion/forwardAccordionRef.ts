import type { Ref, RefObject } from 'react';
import { attachRef } from '../../shared/attachRef.ts';

export function forwardAccordionRef<T>(
  internal: RefObject<T | null>,
  external: Ref<T> | undefined,
  element: T | null,
) {
  internal.current = element;
  if (element === null) {
    if (typeof external === 'function') {
      external(null);
    } else if (external) {
      external.current = null;
    }
    return;
  }
  return attachRef(element, external, () => {
    internal.current = null;
  });
}
