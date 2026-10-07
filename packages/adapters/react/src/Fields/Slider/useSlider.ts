import { useEffect, useRef, useState } from 'react';
import type { ComponentPropsWithRef, CSSProperties, KeyboardEvent, PointerEvent } from 'react';
import { getNavigationDirection, getSteppedValue } from '@dreadnought/core';
import { useFieldValue } from '../../shared/useFieldValue.ts';
import type { UseSliderOptions } from './slider.types.ts';

export function useSlider({ min = 0, max = 100, step = 1, value: controlled, defaultValue, disabled: ownDisabled = false,
  onValueChange, name, form, className, style, slotProps = {}, ...props }: UseSliderOptions = {}) {
  const initial = useRef(defaultValue ?? min);
  const fieldRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const activePointer = useRef<number | null>(null);
  const [inheritedDisabled, setInheritedDisabled] = useState(false);
  const disabled = ownDisabled || inheritedDisabled;
  const [stored, setValue] = useFieldValue(controlled, initial.current, onValueChange, fieldRef, form);
  const grid = { min, max, step };
  const value = getSteppedValue(stored, grid);
  const last = getSteppedValue(max, grid);
  const progress = last === min ? 0 : (value - min) / (last - min);
  function request(candidate: number) {
    const next = getSteppedValue(candidate, grid);
    if (next !== value) setValue(next);
  }
  function isDisabled() { return ownDisabled || !!fieldRef.current?.matches(':disabled'); }
  function stop() {
    const id = activePointer.current;
    activePointer.current = null;
    if (id !== null && rootRef.current?.hasPointerCapture?.(id)) rootRef.current.releasePointerCapture(id);
  }
  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    function syncDisabled() {
      const next = field!.matches(':disabled');
      setInheritedDisabled(next);
      if (next) stop();
    }
    syncDisabled();
    const observer = new MutationObserver(syncDisabled);
    for (let node = field.parentElement; node; node = node.parentElement) {
      if (node.tagName === 'FIELDSET') observer.observe(node, { attributes: true, attributeFilter: ['disabled'] });
    }
    const owner = field.form;
    let attached = true;
    function reset(event: Event) {
      queueMicrotask(() => { if (attached && controlled === undefined && !event.defaultPrevented) stop(); });
    }
    owner?.addEventListener('reset', reset);
    return () => { attached = false; observer.disconnect(); owner?.removeEventListener('reset', reset); };
  });
  useEffect(() => () => stop(), []);
  function move(event: PointerEvent<HTMLDivElement>) {
    const rect = railRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return false;
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    request(min + (last - min) * ratio);
    return true;
  }
  const thumbProps: ComponentPropsWithRef<'div'> & { 'data-slot': string } = { ...props, ...slotProps.thumb, ref: thumbRef,
    role: 'slider', 'data-slot': 'thumb', 'aria-orientation': 'horizontal', 'aria-valuemin': min,
    'aria-valuemax': last, 'aria-valuenow': value, 'aria-disabled': disabled, tabIndex: disabled ? -1 : 0,
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
      props.onKeyDown?.(event);
      slotProps.thumb?.onKeyDown?.(event);
      if (isDisabled() || event.defaultPrevented || event.nativeEvent.isComposing || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
      const direction = getNavigationDirection(event.key, { orientation: 'horizontal' })
        ?? getNavigationDirection(event.key, { homeEnd: false });
      if (!direction) return;
      event.preventDefault();
      request(direction === 'first' ? min : direction === 'last' ? last
        : value + (event.key === 'ArrowRight' || event.key === 'ArrowUp' ? step : -step));
    },
    onPointerDown: event => { props.onPointerDown?.(event); slotProps.thumb?.onPointerDown?.(event); },
    onPointerMove: event => { props.onPointerMove?.(event); slotProps.thumb?.onPointerMove?.(event); },
    onPointerUp: event => { props.onPointerUp?.(event); slotProps.thumb?.onPointerUp?.(event); },
    onPointerCancel: event => { props.onPointerCancel?.(event); slotProps.thumb?.onPointerCancel?.(event); },
    onLostPointerCapture: event => { props.onLostPointerCapture?.(event); slotProps.thumb?.onLostPointerCapture?.(event); },
    onPointerEnter: event => { props.onPointerEnter?.(event); slotProps.thumb?.onPointerEnter?.(event); },
    onPointerLeave: event => { props.onPointerLeave?.(event); slotProps.thumb?.onPointerLeave?.(event); },
    onFocus: event => { props.onFocus?.(event); slotProps.thumb?.onFocus?.(event); },
    onBlur: event => { props.onBlur?.(event); slotProps.thumb?.onBlur?.(event); stop(); },
  };
  const rootProps: ComponentPropsWithRef<'div'> & { 'data-ui': string; 'data-disabled': string | undefined } = { ...slotProps.root, ref: rootRef, className: [className, slotProps.root?.className].filter(Boolean).join(' '),
    style: { ...slotProps.root?.style, ...style, '--dreadnought-slider-progress': `${progress * 100}%` } as CSSProperties,
    'data-ui': 'slider', 'data-disabled': disabled ? '' : undefined,
    onPointerDown: event => {
      slotProps.root?.onPointerDown?.(event);
      if (isDisabled() || event.defaultPrevented || event.button !== 0 || !event.isPrimary || activePointer.current !== null) return;
      if (!move(event)) return;
      event.preventDefault();
      thumbRef.current?.focus({ preventScroll: true });
      activePointer.current = event.pointerId;
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    onPointerMove: event => {
      slotProps.root?.onPointerMove?.(event);
      if (activePointer.current !== event.pointerId) return;
      if (isDisabled()) { stop(); return; }
      if (!event.defaultPrevented) move(event);
    },
    onPointerUp: event => { slotProps.root?.onPointerUp?.(event); if (activePointer.current === event.pointerId) stop(); },
    onPointerCancel: event => { slotProps.root?.onPointerCancel?.(event); if (activePointer.current === event.pointerId) stop(); },
    onLostPointerCapture: event => { slotProps.root?.onLostPointerCapture?.(event); if (activePointer.current === event.pointerId) stop(); },
    onBlur: event => { slotProps.root?.onBlur?.(event); stop(); },
  };
  const fieldProps: ComponentPropsWithRef<'input'> = { ...slotProps.field, ref: fieldRef,
    type: 'hidden', name, form, value, disabled: ownDisabled };
  return { value, min, max: last, progress, disabled, rootRef, railRef, thumbRef, fieldRef, rootProps, thumbProps, fieldProps };
}
