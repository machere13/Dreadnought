import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { DOMAttributes } from 'react';
import { getDisclosureOpen, getTooltipState } from '@dreadnought/core';
import { useAnchoredPopover } from '../../shared/useAnchoredPopover.ts';

export interface UseTooltipOptions { open?: boolean; defaultOpen?: boolean; disabled?: boolean; onOpenChange?: (open: boolean) => void; describedBy?: string }
export type TooltipTriggerProps = DOMAttributes<Element> & { ref: (element: Element | null) => void; 'aria-describedby': string | undefined };

export function useTooltip({ open: controlled, defaultOpen = false, disabled = false, onOpenChange, describedBy }: UseTooltipOptions = {}) {
  const id = useId();
  const [internal, setInternal] = useState(defaultOpen);
  const [anchorElement, setAnchorElement] = useState<Element | null>(null);
  const anchor = useRef<Element | null>(null);
  const popup = useRef<HTMLDivElement>(null);
  const interaction = useRef<{ hovered: Element | null; popupHovered: boolean; focused: Element | null; dismissed: boolean }>({ hovered: null, popupHovered: false, focused: null, dismissed: false });
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const state = getTooltipState({ tooltipId: id, open: controlled ?? internal, disabled, describedBy });
  const currentOptions = useRef({ open: state.open, controlled, disabled, onOpenChange });
  currentOptions.current = { open: state.open, controlled, disabled, onOpenChange };
  useAnchoredPopover(state.open, anchor, popup, anchorElement, false);
  const attach = useCallback((element: Element | null) => { anchor.current = element; setAnchorElement(element); }, []);
  function request(next: boolean) {
    const options = currentOptions.current;
    next = getDisclosureOpen(options.open, next ? 'open' : 'close', { disabled: options.disabled });
    if (next === options.open) return;
    if (options.controlled === undefined) setInternal(next);
    options.onOpenChange?.(next);
  }
  function update() {
    clearTimeout(timer.current);
    const current = interaction.current;
    if (!current.hovered?.isConnected) current.hovered = null;
    if (!current.focused?.isConnected) current.focused = null;
    request(!current.dismissed && !!(current.hovered || current.popupHovered || current.focused));
  }
  function enter(element: Element) {
    attach(element);
    interaction.current.dismissed = false;
    update();
  }
  function leave() {
    clearTimeout(timer.current);
    timer.current = setTimeout(update, 100);
  }
  function dismiss() { interaction.current.dismissed = true; update(); }
  useEffect(() => { if (!state.open) interaction.current.popupHovered = false; }, [state.open]);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!state.open || !anchorElement) return;
    const document = anchorElement.ownerDocument;
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape' && !event.defaultPrevented && !event.isComposing) { event.preventDefault(); dismiss(); }
    }
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [state.open, anchorElement, controlled, disabled, onOpenChange]);
  const triggerProps: TooltipTriggerProps = { ...state.triggerProps, ref: attach,
    onPointerEnter: event => { interaction.current.hovered = event.currentTarget; enter(event.currentTarget); },
    onPointerLeave: () => { interaction.current.hovered = null; leave(); },
    onFocus: event => { interaction.current.focused = event.currentTarget; enter(event.currentTarget); },
    onBlur: () => { interaction.current.focused = null; update(); },
    onKeyDown: event => { if (event.key === 'Escape' && !event.defaultPrevented && !event.nativeEvent.isComposing) { event.preventDefault(); dismiss(); } },
  };
  return { open: state.open, triggerProps, contentProps: { ...state.contentProps, ref: popup,
    onPointerEnter: () => { interaction.current.popupHovered = true; update(); },
    onPointerLeave: () => { interaction.current.popupHovered = false; leave(); },
  } };
}
