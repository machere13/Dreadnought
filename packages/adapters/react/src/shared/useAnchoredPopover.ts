import { useLayoutEffect } from 'react';
import type { RefObject } from 'react';
import { getTooltipPosition } from '@dreadnought/core';
import type { TooltipPlacement } from '@dreadnought/core';

export interface AnchoredTooltipOptions { placement: TooltipPlacement; autoAdjustOverflow: boolean; pointAtCenter: boolean; arrow: boolean; arrowSelector?: string; arrowPositionProperty?: string }

export function useAnchoredPopover(open: boolean, anchor: RefObject<Element | null>, popup: RefObject<HTMLElement | null>, anchorElement: Element | null = anchor.current, matchAnchorWidth = true, tooltip?: AnchoredTooltipOptions) {
  function position() {
    const node = popup.current;
    if (!open || !node || !anchor.current) return;
    const rect = anchor.current.getBoundingClientRect();
    const viewport = node.ownerDocument.documentElement;
    node.style.minWidth = matchAnchorWidth ? `${Math.min(rect.width, viewport.clientWidth)}px` : '0px';
    const box = node.getBoundingClientRect();
    if (tooltip) {
      const computed = node.ownerDocument.defaultView?.getComputedStyle(node);
      const arrowNode = tooltip.arrow ? node.querySelector(tooltip.arrowSelector ?? '[data-ui="tooltip-arrow"]') : null;
      const arrowSize = arrowNode ? (parseFloat(node.ownerDocument.defaultView?.getComputedStyle(arrowNode).width ?? '') || 0) * Math.SQRT2 : 0;
      const gap = (parseFloat(computed?.rowGap ?? '') || 0) + arrowSize / 2;
      const arrowPadding = (parseFloat(computed?.borderTopLeftRadius ?? '') || 0) + arrowSize / 2;
      const result = getTooltipPosition({ anchor: rect, popup: box, viewport: { width: viewport.clientWidth, height: viewport.clientHeight }, ...tooltip, gap, arrowPadding });
      node.style.left = `${result.left}px`;
      node.style.top = `${result.top}px`;
      node.style.setProperty(tooltip.arrowPositionProperty ?? '--dreadnought-tooltip-arrow-position', `${result.arrow}px`);
      node.dataset.placement = result.placement;
      return;
    }
    node.style.left = `${Math.max(0, Math.min(rect.left, viewport.clientWidth - box.width))}px`;
    node.style.top = `${Math.max(0, rect.bottom + box.height <= viewport.clientHeight ? rect.bottom : rect.top - box.height)}px`;
  }
  useLayoutEffect(() => {
    const node = popup.current;
    if (!open || !node) return;
    const view = node.ownerDocument.defaultView;
    if (node.showPopover) Reflect.apply(node.showPopover, node, anchor.current?.namespaceURI === 'http://www.w3.org/1999/xhtml' ? [{ source: anchor.current }] : []);
    const observer = view?.ResizeObserver ? new view.ResizeObserver(position) : undefined;
    if (anchor.current) observer?.observe(anchor.current);
    observer?.observe(node);
    view?.addEventListener('resize', position);
    view?.addEventListener('scroll', position, true);
    return () => {
      observer?.disconnect();
      view?.removeEventListener('resize', position);
      view?.removeEventListener('scroll', position, true);
      if (node.hidePopover && node.matches(':popover-open')) node.hidePopover();
    };
  }, [open, anchor, popup, anchorElement, matchAnchorWidth, tooltip?.placement, tooltip?.autoAdjustOverflow, tooltip?.pointAtCenter, tooltip?.arrow, tooltip?.arrowSelector, tooltip?.arrowPositionProperty]);
  useLayoutEffect(position);
}
