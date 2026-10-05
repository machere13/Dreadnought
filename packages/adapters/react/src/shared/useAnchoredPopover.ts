import { useLayoutEffect } from 'react';
import type { RefObject } from 'react';

export function useAnchoredPopover(open: boolean, anchor: RefObject<Element | null>, popup: RefObject<HTMLElement | null>, anchorElement: Element | null = anchor.current, matchAnchorWidth = true) {
  useLayoutEffect(() => {
    const node = popup.current;
    if (!open || !node) return;
    const view = node.ownerDocument.defaultView;
    if (node.showPopover) Reflect.apply(node.showPopover, node, anchor.current?.namespaceURI === 'http://www.w3.org/1999/xhtml' ? [{ source: anchor.current }] : []);
    function position() {
      if (!node || !anchor.current) return;
      const rect = anchor.current.getBoundingClientRect();
      const viewport = node.ownerDocument.documentElement;
      node.style.minWidth = matchAnchorWidth ? `${Math.min(rect.width, viewport.clientWidth)}px` : '0px';
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
      if (node.hidePopover && node.matches(':popover-open')) node.hidePopover();
    };
  }, [open, anchor, popup, anchorElement, matchAnchorWidth]);
}
