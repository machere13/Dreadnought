import { useLayoutEffect } from 'react';
import type { RefObject } from 'react';

export function useTreeSelectViewport(
  open: boolean,
  root: RefObject<HTMLElement | null>,
  popup: RefObject<HTMLElement | null>,
  autoAdjustOverflow: boolean,
) {
  useLayoutEffect(() => {
    const anchor = root.current;
    const panel = popup.current;
    const viewport = panel?.querySelector<HTMLElement>('[data-slot="viewport"]');
    const view = panel?.ownerDocument.defaultView;
    if (!open || !anchor || !panel || !viewport || !view) return;
    const resize = () => {
      if (!anchor.isConnected || !panel.isConnected) return;
      const rect = anchor.getBoundingClientRect();
      const document = panel.ownerDocument.documentElement;
      panel.style.width = `${Math.min(rect.width, document.clientWidth || view.innerWidth)}px`;
      viewport.style.maxHeight = '';
      if (!autoAdjustOverflow) return;
      const height = document.clientHeight || view.innerHeight;
      const available = Math.min(height, Math.max(0, rect.top, height - rect.bottom));
      const style = view.getComputedStyle(panel);
      const edges = ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'] as const;
      const frame = edges.reduce((sum, key) => sum + (Number.parseFloat(style[key]) || 0), 0);
      const limit = Number.parseFloat(view.getComputedStyle(viewport).maxHeight);
      viewport.style.maxHeight = `${Math.max(0, Math.min(Number.isFinite(limit) ? limit : Infinity, available - frame))}px`;
    };
    const scroll = (event: Event) => {
      if (!(event.target instanceof view.Node && panel.contains(event.target))) resize();
    };
    resize();
    const observer = view.ResizeObserver ? new view.ResizeObserver(resize) : undefined;
    observer?.observe(anchor);
    view.addEventListener('resize', resize);
    view.addEventListener('scroll', scroll, true);
    return () => {
      observer?.disconnect();
      view.removeEventListener('resize', resize);
      view.removeEventListener('scroll', scroll, true);
    };
  }, [open, root, popup, autoAdjustOverflow]);
}
