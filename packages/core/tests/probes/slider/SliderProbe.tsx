import { useEffect, useRef, useState } from 'react';
import type { KeyboardEventHandler, PointerEvent } from 'react';
import { getNavigationDirection, getSteppedValue } from '@dreadnought/core';

export function SliderProbe({ defaultValue, min = 0, max = 100, step = 1, disabled = false, onKeyDown }: {
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
}) {
  const grid = { min, max, step };
  const initial = useRef(defaultValue ?? min);
  const [stored, setValue] = useState(() => getSteppedValue(initial.current, grid));
  const value = getSteppedValue(stored, grid);
  const last = getSteppedValue(max, grid);
  const field = useRef<HTMLInputElement>(null);
  const activePointer = useRef<number | null>(null);
  useEffect(() => {
    const form = field.current?.form;
    function reset(event: Event) {
      queueMicrotask(() => { if (!event.defaultPrevented) setValue(getSteppedValue(initial.current, { min, max, step })); });
    }
    form?.addEventListener('reset', reset);
    return () => form?.removeEventListener('reset', reset);
  }, [min, max, step]);
  function stop(node: HTMLDivElement) {
    const id = activePointer.current;
    activePointer.current = null;
    if (id !== null && node.hasPointerCapture?.(id)) node.releasePointerCapture(id);
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    const { left, width } = event.currentTarget.getBoundingClientRect();
    if (width <= 0) return false;
    const ratio = Math.max(0, Math.min(1, (event.clientX - left) / width));
    setValue(getSteppedValue(min + (max - min) * ratio, grid));
    return true;
  }
  return <div>
    <div role="slider" aria-label="Volume" aria-orientation="horizontal" aria-valuemin={min}
      aria-valuemax={last} aria-valuenow={value} aria-disabled={disabled} tabIndex={disabled ? -1 : 0}
      onKeyDown={event => {
        onKeyDown?.(event);
        if (disabled || event.defaultPrevented || event.nativeEvent.isComposing || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
        const direction = getNavigationDirection(event.key, { orientation: 'horizontal' })
          ?? getNavigationDirection(event.key, { homeEnd: false });
        if (!direction) return;
        event.preventDefault();
        const candidate = direction === 'first' ? min : direction === 'last' ? max
          : value + (event.key === 'ArrowRight' || event.key === 'ArrowUp' ? step : -step);
        setValue(getSteppedValue(candidate, grid));
      }} onPointerDown={event => {
        if (disabled || event.defaultPrevented || event.button !== 0 || !event.isPrimary || activePointer.current !== null) return;
        if (!move(event)) return;
        event.preventDefault();
        event.currentTarget.focus();
        activePointer.current = event.pointerId;
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }} onPointerMove={event => {
        if (activePointer.current !== event.pointerId) return;
        if (disabled) { stop(event.currentTarget); return; }
        if (!event.defaultPrevented) move(event);
      }} onPointerUp={event => { if (activePointer.current === event.pointerId) stop(event.currentTarget); }}
      onPointerCancel={event => { if (activePointer.current === event.pointerId) stop(event.currentTarget); }}
      onLostPointerCapture={event => { if (activePointer.current === event.pointerId) activePointer.current = null; }}
      onBlur={event => stop(event.currentTarget)}>
      Volume: {value}
    </div>
    <input ref={field} type="hidden" name="volume" value={value} disabled={disabled} />
    <output role="status">{value}</output>
  </div>;
}
