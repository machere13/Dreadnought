import type { ToastCore, ToastCoreOptions } from './ToastCore.ts';

export function getToastState({ open = true, type = 'info' }: ToastCoreOptions = {}): ToastCore {
  return { open, rootProps: { role: open ? (type === 'error' || type === 'warning' ? 'alert' : 'status') : undefined, 'aria-atomic': true } };
}
