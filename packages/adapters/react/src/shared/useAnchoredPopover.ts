import { useLayoutEffect } from 'react';
import type { RefObject } from 'react';

/** Only browser geometry; visual values belong to the UI layer. */
export function useAnchoredPopover(open: boolean, anchor: RefObject<HTMLElement | null>, popup: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const node = popup.current;
    if (!open || !node) return;
    const view = node.ownerDocument.defaultView;
    // source preserves native nesting when the popup is rendered through a portal.
    if (node.showPopover) Reflect.apply(node.showPopover, node, [{ source: anchor.current ?? undefined }]);
    function position() {
      if (!node || !anchor.current) return;
      const rect = anchor.current.getBoundingClientRect();
      const viewport = node.ownerDocument.documentElement;
      node.style.minWidth = `${Math.min(rect.width, viewport.clientWidth)}px`;
      const box = node.getBoundingClientRect();
      node.style.left = `${Math.max(0, Math.min(rect.left, viewport.clientWidth - box.width))}px`;
      node.style.top = `${Math.max(0, rect.bottom + box.height <= viewport.clientHeight ? rect.bottom : rect.top - box.height)}px`;
    }
    position();
    const observer = view?.ResizeObserver ? new view.ResizeObserver(position) : undefined;
    if (anchor.current) observer?.observe(anchor.current);
    observer?.observe(node);
    view?.addEventListener('resize', position);
    view?.addEventListener('scroll', position, true);
    return () => {
      observer?.disconnect();
      view?.removeEventListener('resize', position);
      view?.removeEventListener('scroll', position, true);
      if (node.matches(':popover-open')) node.hidePopover?.();
    };
  }, [open, anchor, popup]);
}
