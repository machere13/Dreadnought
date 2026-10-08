import type { Ref } from 'react';

export function attachRef<T>(
  element: T,
  consumerRef: Ref<T> | undefined,
  cleanup: () => void,
): () => void {
  let consumerCleanup: void | (() => void);
  if (typeof consumerRef === 'function') {
    consumerCleanup = consumerRef(element);
  } else if (consumerRef) {
    consumerRef.current = element;
  }
  return () => {
    cleanup();
    if (typeof consumerCleanup === 'function') {
      consumerCleanup();
    } else if (typeof consumerRef === 'function') {
      consumerRef(null);
    } else if (consumerRef) {
      consumerRef.current = null;
    }
  };
}
