import { useLayoutEffect } from 'react';
import type { RefObject } from 'react';

/** Only browser geometry; visual values belong to the UI layer. */
export function useAnchoredPopover(open: boolean, anchor: RefObject<HTMLElement | null>, popup: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const node = popup.current;
    if (!open || !node) return;
    node.showPopover?.();
    function position() {
      if (!node || !anchor.current) return;
      const rect = anchor.current.getBoundingClientRect();
      const viewport = document.documentElement;
      node.style.minWidth = `${Math.min(rect.width, viewport.clientWidth)}px`;
      const box = node.getBoundingClientRect();
      node.style.left = `${Math.max(0, Math.min(rect.left, viewport.clientWidth - box.width))}px`;
      node.style.top = `${Math.max(0, rect.bottom + box.height <= viewport.clientHeight ? rect.bottom : rect.top - box.height)}px`;
    }
    position();
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(position);
    if (anchor.current) observer?.observe(anchor.current);
    observer?.observe(node);
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', position);
      window.removeEventListener('scroll', position, true);
      if (node.matches(':popover-open')) node.hidePopover?.();
    };
  }, [open, anchor, popup]);
}
