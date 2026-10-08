import type { TooltipCore, TooltipCoreOptions } from './TooltipCore.ts';

export function getTooltipState({
  tooltipId,
  open = false,
  disabled = false,
  describedBy,
}: TooltipCoreOptions): TooltipCore {
  if (typeof tooltipId !== 'string' || !tooltipId || /[\t\n\f\r ]/.test(tooltipId)) {
    throw new TypeError('Tooltip needs a nonempty ID without ASCII whitespace.');
  }
  const visible = open && !disabled;
  const ids = [
    ...new Set(
      `${describedBy ?? ''} ${visible ? tooltipId : ''}`.trim().split(/\s+/).filter(Boolean),
    ),
  ];
  return {
    open: visible,
    triggerProps: { 'aria-describedby': ids.join(' ') || undefined },
    contentProps: { id: tooltipId, role: 'tooltip', hidden: !visible },
  };
}
