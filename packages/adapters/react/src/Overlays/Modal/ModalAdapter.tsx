import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import type { ContentMountPolicy } from '@dreadnought/core';
import { useContentMount } from '../../shared/useContentMount.ts';
import { useModal } from './useModal.ts';
import type { ModalTriggerProps, UseModalOptions } from './useModal.ts';

export interface ModalControls {
  close: () => void;
}
export type ModalAdapterProps = UseModalOptions &
  Omit<
    ComponentPropsWithoutRef<'dialog'>,
    | 'children'
    | 'content'
    | 'id'
    | 'role'
    | 'open'
    | 'hidden'
    | 'popover'
    | 'tabIndex'
    | 'aria-modal'
    | 'dangerouslySetInnerHTML'
  > & {
    children: (trigger: ModalTriggerProps) => ReactNode;
    content: ReactNode | ((controls: ModalControls) => ReactNode);
    mountPolicy?: ContentMountPolicy;
  };

export function ModalAdapter({
  children,
  content,
  mountPolicy = 'eager',
  open,
  defaultOpen,
  disabled,
  onOpenChange,
  closeOnEscape,
  closeOnBackdrop,
  onCancel,
  onClose,
  onKeyDown,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  'aria-labelledby': labelledBy,
  ...native
}: ModalAdapterProps) {
  const modal = useModal({
    open,
    defaultOpen,
    disabled,
    onOpenChange,
    closeOnEscape,
    closeOnBackdrop,
  });
  const mounted = useContentMount(modal.open, mountPolicy);
  return (
    <>
      {children(modal.triggerProps)}
      <dialog
        {...native}
        {...modal.contentProps}
        data-ui="modal"
        aria-labelledby={
          native['aria-label'] ? labelledBy : (labelledBy ?? modal.contentProps['aria-labelledby'])
        }
        onCancel={(event) => {
          onCancel?.(event);
          modal.contentProps.onCancel(event);
        }}
        onClose={(event) => {
          if (event.currentTarget.open) {
            return;
          }
          onClose?.(event);
          modal.contentProps.onClose();
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          modal.contentProps.onKeyDown(event);
        }}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          modal.contentProps.onPointerDown(event);
        }}
        onPointerUp={(event) => {
          onPointerUp?.(event);
          modal.contentProps.onPointerUp(event);
        }}
        onPointerCancel={(event) => {
          onPointerCancel?.(event);
          modal.contentProps.onPointerCancel();
        }}
      >
        {mounted
          ? typeof content === 'function'
            ? content({ close: modal.close })
            : content
          : null}
      </dialog>
    </>
  );
}
