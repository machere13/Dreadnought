import type { Ref } from 'react';
import { attachRef } from '../../shared/attachRef.ts';

export function forwardTabsRef<T>(
  element: T | null,
  consumerRef: Ref<T> | undefined,
  unregister: () => void,
): void | (() => void) {
  if (element === null) {
    if (typeof consumerRef === 'function') consumerRef(null);
    else if (consumerRef) consumerRef.current = null;
    return;
  }

  return attachRef(element, consumerRef, unregister);
}
