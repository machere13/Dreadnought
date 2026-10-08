export type TooltipPlacement =
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight'
  | 'left'
  | 'leftTop'
  | 'leftBottom'
  | 'right'
  | 'rightTop'
  | 'rightBottom';
export interface TooltipPositionOptions {
  anchor: { left: number; top: number; width: number; height: number };
  popup: { width: number; height: number };
  viewport: { width: number; height: number };
  placement?: TooltipPlacement;
  gap?: number;
  arrowPadding?: number;
  pointAtCenter?: boolean;
  autoAdjustOverflow?: boolean;
}

export function getTooltipPosition({
  anchor,
  popup,
  viewport,
  placement = 'top',
  gap = 0,
  arrowPadding = 0,
  pointAtCenter = false,
  autoAdjustOverflow = true,
}: TooltipPositionOptions) {
  let side: 'top' | 'bottom' | 'left' | 'right' = placement.startsWith('top')
    ? 'top'
    : placement.startsWith('bottom')
      ? 'bottom'
      : placement.startsWith('left')
        ? 'left'
        : 'right';
  const alignment = placement.slice(side.length);
  const space = {
    top: anchor.top,
    bottom: viewport.height - anchor.top - anchor.height,
    left: anchor.left,
    right: viewport.width - anchor.left - anchor.width,
  };
  const opposite = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' } as const;
  const requiredSpace = (side === 'top' || side === 'bottom' ? popup.height : popup.width) + gap;
  if (autoAdjustOverflow && space[side] < requiredSpace && space[opposite[side]] > space[side]) {
    side = opposite[side];
  }
  const vertical = side === 'top' || side === 'bottom';
  const start = vertical ? anchor.left : anchor.top;
  const targetSize = vertical ? anchor.width : anchor.height;
  const size = vertical ? popup.width : popup.height;
  const end = alignment === 'Right' || alignment === 'Bottom';
  let cross = alignment ? start + (end ? targetSize - size : 0) : start + (targetSize - size) / 2;
  if (autoAdjustOverflow && !alignment) {
    cross = Math.max(0, Math.min(cross, (vertical ? viewport.width : viewport.height) - size));
  }
  const padding = Math.min(arrowPadding, size / 2);
  const arrow = Math.max(
    padding,
    Math.min(
      size - padding,
      !alignment || pointAtCenter ? start + targetSize / 2 - cross : end ? size - padding : padding,
    ),
  );
  if (alignment && pointAtCenter) {
    cross = start + targetSize / 2 - arrow;
  }
  const main =
    side === 'top'
      ? anchor.top - popup.height - gap
      : side === 'bottom'
        ? anchor.top + anchor.height + gap
        : side === 'left'
          ? anchor.left - popup.width - gap
          : anchor.left + anchor.width + gap;
  return {
    left: vertical ? cross : main,
    top: vertical ? main : cross,
    arrow,
    placement: `${side}${alignment}` as TooltipPlacement,
  };
}
