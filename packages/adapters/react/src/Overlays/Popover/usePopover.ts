import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { getDisclosureOpen, getPopoverState } from '@dreadnought/core';
import type { TooltipPlacement } from '@dreadnought/core';
import { useAnchoredPopover } from '../../shared/useAnchoredPopover.ts';

export interface UsePopoverOptions {
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: TooltipPlacement;
  arrow?: boolean | { pointAtCenter: boolean };
  autoAdjustOverflow?: boolean;
}
export type PopoverTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & { ref: (element: HTMLButtonElement | null) => void };

export function usePopover({ open: controlled, defaultOpen = false, disabled = false, onOpenChange,
  placement = 'bottom', arrow = true, autoAdjustOverflow = true }: UsePopoverOptions = {}) {
  const id = useId();
  const [internal, setInternal] = useState(defaultOpen);
  const [anchorElement, setAnchorElement] = useState<HTMLButtonElement | null>(null);
  const anchor = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<boolean | undefined>(undefined);
  const focusInside = useRef(false);
  const state = getPopoverState({ triggerId: `${id}-trigger`, panelId: id, open: controlled ?? internal, disabled });
  const current = useRef({ open: state.open, controlled, disabled, onOpenChange });
  current.current = { open: state.open, controlled, disabled, onOpenChange };
  const attach = useCallback((element: HTMLButtonElement | null) => { anchor.current = element; setAnchorElement(element); }, []);
  useAnchoredPopover(state.open, anchor, popup, anchorElement, false, {
    placement, arrow: arrow !== false, pointAtCenter: typeof arrow === 'object' && arrow.pointAtCenter, autoAdjustOverflow,
    arrowSelector: '[data-ui="popover-arrow"]', arrowPositionProperty: '--dreadnought-popover-arrow-position',
  });
  function request(next: boolean, returnFocus = false) {
    const options = current.current;
    next = getDisclosureOpen(options.open, next ? 'open' : 'close', { disabled: options.disabled });
    if (next === options.open) return;
    restoreFocus.current = next ? undefined : returnFocus;
    if (options.controlled === undefined) setInternal(next);
    options.onOpenChange?.(next);
  }
  useLayoutEffect(() => {
    if (state.open) {
      const node = popup.current;
      if (!node) return;
      const controls = node.querySelectorAll<HTMLElement>('button, a[href], input:not([type="hidden"]), select, textarea, [tabindex], [contenteditable="true"]');
      const first = [...controls].find(element => {
        if (element.tabIndex < 0 || element.matches(':disabled') || element.closest('[hidden], [inert], [aria-hidden="true"]')) return false;
        for (let parent: HTMLElement | null = element; parent && node.contains(parent); parent = parent.parentElement) {
          const style = node.ownerDocument.defaultView?.getComputedStyle(parent);
          if (style?.display === 'none' || style?.visibility === 'hidden') return false;
        }
        return true;
      });
      (first ?? node).focus({ preventScroll: true });
      focusInside.current = node.contains(node.ownerDocument.activeElement);
      restoreFocus.current = undefined;
    } else {
      if (restoreFocus.current ?? focusInside.current) anchor.current?.focus({ preventScroll: true });
      restoreFocus.current = undefined;
      focusInside.current = false;
    }
  }, [state.open]);
  useEffect(() => {
    const node = popup.current;
    if (!state.open || !node) return;
    const document = node.ownerDocument;
    let tabbing = false;
    function outside(event: PointerEvent) {
      tabbing = false;
      const path = event.composedPath();
      if (!event.defaultPrevented && !path.includes(node!) && !path.includes(anchor.current!)) request(false);
    }
    function focus(event: FocusEvent) {
      const path = event.composedPath();
      focusInside.current = path.includes(node!);
      if (!focusInside.current && (tabbing || !path.includes(anchor.current!))) request(false);
      tabbing = false;
    }
    function escape(event: KeyboardEvent) {
      if (event.key === 'Tab' && !event.defaultPrevented && !event.isComposing) { tabbing = true; return; }
      const target = event.target instanceof Element ? event.target : document.activeElement;
      const nearest = target?.closest('[popover]');
      if (nearest && nearest !== node) return;
      if (event.key === 'Escape' && !event.defaultPrevented && !event.isComposing) { event.preventDefault(); request(false, true); }
    }
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', focus);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', focus);
      document.removeEventListener('keydown', escape);
    };
  }, [state.open]);
  const triggerProps: PopoverTriggerProps = { ...state.triggerProps, ref: attach,
    onClick: () => request(!current.current.open, true) };
  return { open: state.open, triggerProps, contentProps: { ...state.contentProps, ref: popup, tabIndex: -1 }, close: () => request(false, true) };
}
