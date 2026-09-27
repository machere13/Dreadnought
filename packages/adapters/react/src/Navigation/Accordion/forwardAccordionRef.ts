import type { Ref, RefObject } from 'react';

export function forwardAccordionRef<T>(internal: RefObject<T | null>, external: Ref<T> | undefined, element: T | null) {
  internal.current = element;
  if (typeof external === 'function') {
    const cleanup = external(element);
    if (element === null) return;
    return () => {
      internal.current = null;
      if (typeof cleanup === 'function') cleanup();
      else external(null);
    };
  }
  if (external) external.current = element;
  if (element === null) return;
  return () => {
    internal.current = null;
    if (external) external.current = null;
  };
}
