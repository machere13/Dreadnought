import { useCallback, useEffect, useRef, useState } from 'react';
import { getCountdownRemaining } from '@dreadnought/core';

export interface UseToastOptions {
  open?: boolean;
  defaultOpen?: boolean;
  duration?: number;
  onOpenChange?: (open: boolean) => void;
}

export function useToast({
  open: controlledOpen,
  defaultOpen = true,
  duration = 3000,
  onOpenChange,
}: UseToastOptions = {}) {
  getCountdownRemaining(duration, 0);
  if (duration > 2147483647) {
    throw new RangeError('Toast duration exceeds the browser timer limit.');
  }
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const open = controlledOpen ?? localOpen;
  const remaining = useRef(duration);
  const requested = useRef(false);
  const callback = useRef(onOpenChange);
  useEffect(() => {
    callback.current = onOpenChange;
  }, [onOpenChange]);
  const close = useCallback(() => {
    if (requested.current) {
      return;
    }
    requested.current = true;
    setLocalOpen(false);
    callback.current?.(false);
  }, []);
  useEffect(() => {
    remaining.current = duration;
    requested.current = false;
    if (!open) {
      setHovered(false);
      setFocused(false);
    }
  }, [duration, open]);
  useEffect(() => {
    if (!open || duration === 0 || hovered || focused || requested.current) {
      return;
    }
    const started = Date.now();
    const timer = setTimeout(close, remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current = getCountdownRemaining(
        remaining.current,
        Math.max(0, Date.now() - started),
      );
    };
  }, [open, duration, hovered, focused, close]);
  return { open, close, setHovered, setFocused };
}
