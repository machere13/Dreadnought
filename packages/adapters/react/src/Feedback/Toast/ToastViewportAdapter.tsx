import type { ComponentPropsWithRef } from 'react';

export type ToastPlacement =
  'top-start' | 'top' | 'top-end' | 'bottom-start' | 'bottom' | 'bottom-end';
export type ToastViewportAdapterProps = ComponentPropsWithRef<'div'> & {
  placement?: ToastPlacement;
};

export function ToastViewportAdapter({
  placement = 'top-end',
  ...props
}: ToastViewportAdapterProps) {
  return (
    <div
      role="region"
      aria-label="Notifications"
      {...props}
      data-ui="toast-viewport"
      data-placement={placement}
    />
  );
}
