import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { useTooltip } from './useTooltip.ts';
import type { TooltipTriggerProps, UseTooltipOptions } from './useTooltip.ts';

export type TooltipAdapterProps = UseTooltipOptions & Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'content' | 'id' | 'role' | 'hidden' | 'popover' | 'dangerouslySetInnerHTML'> & {
  content: ReactNode; children: (trigger: TooltipTriggerProps) => ReactNode;
};
export function TooltipAdapter({ content, children, open, defaultOpen, disabled, onOpenChange, describedBy,
  style, onPointerEnter, onPointerLeave, placement = 'top', arrow = true, autoAdjustOverflow = true, ...native }: TooltipAdapterProps) {
  const tooltip = useTooltip({ open, defaultOpen, disabled, onOpenChange, describedBy, placement, arrow, autoAdjustOverflow });
  return <>{children(tooltip.triggerProps)}{tooltip.open && <div {...native} {...tooltip.contentProps} popover="manual" data-ui="tooltip"
    style={{ position: 'fixed', inset: 'auto', margin: 0, ...style }}
    onPointerEnter={event => { onPointerEnter?.(event); if (!event.defaultPrevented) tooltip.contentProps.onPointerEnter(); }}
    onPointerLeave={event => { onPointerLeave?.(event); if (!event.defaultPrevented) tooltip.contentProps.onPointerLeave(); }}>{arrow !== false && <span data-ui="tooltip-arrow" aria-hidden="true" />}{content}</div>}</>;
}
