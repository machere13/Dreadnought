import { useCallback, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, FocusEvent, KeyboardEvent } from 'react';
import { getDisclosureOpen, getFloatingPanelState } from '@dreadnought/core';

export interface UseFloatingPanelOptions {
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
}
export type FloatingPanelTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  ref: (node: HTMLButtonElement | null) => void;
};

export function useFloatingPanel({
  open: controlled,
  defaultOpen = false,
  disabled = false,
  onOpenChange,
}: UseFloatingPanelOptions = {}) {
  const id = useId();
  const [internal, setInternal] = useState(defaultOpen);
  const [panel, attachPanel] = useState<HTMLDivElement | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const focusInside = useRef(false);
  const state = getFloatingPanelState({
    triggerId: `${id}-trigger`,
    panelId: id,
    open: controlled ?? internal,
    disabled,
  });
  const current = useRef({ open: state.open, controlled, disabled, onOpenChange });
  current.current = { open: state.open, controlled, disabled, onOpenChange };
  const attachTrigger = useCallback((node: HTMLButtonElement | null) => {
    trigger.current = node;
  }, []);

  function request(next: boolean) {
    const options = current.current;
    next = getDisclosureOpen(options.open, next ? 'open' : 'close', options);
    if (next === options.open) return;
    if (options.controlled === undefined) {
      options.open = next;
      setInternal(next);
    }
    options.onOpenChange?.(next);
  }

  useLayoutEffect(() => {
    if (state.open && panel) {
      panel.focus({ preventScroll: true });
      focusInside.current = true;
    } else if (!state.open && focusInside.current) {
      trigger.current?.focus({ preventScroll: true });
      focusInside.current = false;
    }
  }, [state.open, panel]);

  function keyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.defaultPrevented || event.nativeEvent.isComposing || event.key !== 'Escape') return;
    const nearest = (event.target as Element).closest('[popover], [role="dialog"], dialog');
    if (nearest && nearest !== event.currentTarget) return;
    event.preventDefault();
    request(false);
  }
  function blur(event: FocusEvent<HTMLDivElement>) {
    if (!current.current.open) return;
    const target = event.relatedTarget;
    focusInside.current =
      !!target && 'nodeType' in target && event.currentTarget.contains(target as Node);
  }
  const triggerProps: FloatingPanelTriggerProps = {
    ...state.triggerProps,
    ref: attachTrigger,
    onClick: () => request(!current.current.open),
  };
  return {
    open: state.open,
    triggerProps,
    contentProps: {
      ...state.contentProps,
      ref: attachPanel,
      tabIndex: -1,
      onKeyDown: keyDown,
      onFocusCapture: () => {
        focusInside.current = true;
      },
      onBlurCapture: blur,
    },
    show: () => request(true),
    close: () => request(false),
  };
}
