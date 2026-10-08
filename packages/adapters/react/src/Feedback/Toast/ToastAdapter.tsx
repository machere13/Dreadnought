import type { ComponentPropsWithRef, ReactNode } from 'react';
import { getToastState, type ToastType } from '@dreadnought/core';
import { useToast, type UseToastOptions } from './useToast.ts';

export type ToastSlotClassNames = Partial<
  Record<'icon' | 'content' | 'title' | 'description' | 'action' | 'close', string>
>;
export type ToastAdapterProps = Omit<ComponentPropsWithRef<'div'>, 'title' | 'children'> &
  UseToastOptions & {
    title: ReactNode;
    description?: ReactNode;
    type?: ToastType;
    icon?: ReactNode;
    action?: ReactNode;
    closable?: boolean;
    closeIcon?: ReactNode;
    closeLabel?: string;
    slotClassNames?: ToastSlotClassNames;
  };

export function ToastAdapter({
  title,
  description,
  type = 'info',
  icon,
  action,
  closable = true,
  closeIcon,
  closeLabel = 'Close notification',
  open,
  defaultOpen,
  duration,
  onOpenChange,
  slotClassNames,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: ToastAdapterProps) {
  const toast = useToast({ open, defaultOpen, duration, onOpenChange });
  const state = getToastState({ open: toast.open, type });
  if (!state.open) {
    return null;
  }
  return (
    <div
      {...state.rootProps}
      {...props}
      data-ui="toast"
      data-type={type}
      onMouseEnter={(event) => {
        toast.setHovered(true);
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        toast.setHovered(false);
        onMouseLeave?.(event);
      }}
      onFocus={(event) => {
        toast.setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          toast.setFocused(false);
        }
        onBlur?.(event);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (
          !event.defaultPrevented &&
          !event.nativeEvent.isComposing &&
          event.key === 'Escape' &&
          closable
        ) {
          event.preventDefault();
          toast.close();
        }
      }}
    >
      {icon != null && (
        <span data-slot="icon" className={slotClassNames?.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <div data-slot="content" className={slotClassNames?.content}>
        <div data-slot="title" className={slotClassNames?.title}>
          {title}
        </div>
        {description != null && (
          <div data-slot="description" className={slotClassNames?.description}>
            {description}
          </div>
        )}
        {action != null && (
          <div data-slot="action" className={slotClassNames?.action}>
            {action}
          </div>
        )}
      </div>
      {closable && (
        <button
          type="button"
          data-slot="close"
          className={slotClassNames?.close}
          aria-label={closeLabel}
          onClick={toast.close}
        >
          {closeIcon ?? 'Close'}
        </button>
      )}
    </div>
  );
}
