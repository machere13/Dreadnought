import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { usePopover } from './usePopover.ts';
import type { PopoverTriggerProps, UsePopoverOptions } from './usePopover.ts';

export interface PopoverControls {
  close: () => void;
}
export type PopoverAdapterProps = UsePopoverOptions &
  Omit<
    ComponentPropsWithoutRef<'div'>,
    | 'children'
    | 'content'
    | 'id'
    | 'role'
    | 'hidden'
    | 'popover'
    | 'tabIndex'
    | 'aria-modal'
    | 'dangerouslySetInnerHTML'
  > & {
    content: ReactNode | ((controls: PopoverControls) => ReactNode);
    children: (trigger: PopoverTriggerProps) => ReactNode;
  };

export function PopoverAdapter({
  content,
  children,
  open,
  defaultOpen,
  disabled,
  onOpenChange,
  placement = 'bottom',
  arrow = true,
  autoAdjustOverflow = true,
  style,
  'aria-labelledby': labelledBy,
  ...native
}: PopoverAdapterProps) {
  const popover = usePopover({
    open,
    defaultOpen,
    disabled,
    onOpenChange,
    placement,
    arrow,
    autoAdjustOverflow,
  });
  return (
    <>
      {children(popover.triggerProps)}
      {popover.open && (
        <div
          {...native}
          {...popover.contentProps}
          aria-labelledby={
            native['aria-label']
              ? labelledBy
              : (labelledBy ?? popover.contentProps['aria-labelledby'])
          }
          popover="manual"
          data-ui="popover"
          style={{ position: 'fixed', inset: 'auto', margin: 0, ...style }}
        >
          {arrow !== false && <span data-ui="popover-arrow" aria-hidden="true" />}
          {typeof content === 'function' ? content({ close: popover.close }) : content}
        </div>
      )}
    </>
  );
}
