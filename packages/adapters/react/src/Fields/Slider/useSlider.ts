import { useEffect, useRef, useState } from 'react';
import type { ComponentPropsWithRef, ComponentPropsWithoutRef, CSSProperties, KeyboardEvent, PointerEvent } from 'react';
import { getNavigationDirection, getSteppedRange, getSteppedValue } from '@dreadnought/core';
import { useFieldValue } from '../../shared/useFieldValue.ts';
import type { SliderRange, UseRangeSliderOptions, UseSingleSliderOptions, UseSliderOptions } from './slider.types.ts';

type SliderResult<T> = Omit<ReturnType<typeof useSliderImplementation>, 'value'> & { value: T };

export function useSlider(options: UseRangeSliderOptions): SliderResult<SliderRange>;
export function useSlider(options?: UseSingleSliderOptions): SliderResult<number>;
export function useSlider(options: UseSliderOptions): SliderResult<number | SliderRange>;
export function useSlider(options: UseSliderOptions = {}): SliderResult<number | SliderRange> {
  return useSliderImplementation(options);
}

function useSliderImplementation(options: UseSliderOptions) {
  const { min = 0, max = 100, step = 1, range = false, value: controlled, defaultValue, disabled: ownDisabled = false,
    onValueChange, name, form, className, style, slotProps = {}, ...props } = options;
  const initial = useRef(defaultValue ?? (range ? [min, max] as const : min));
  const fieldRef = useRef<HTMLInputElement>(null);
  const upperFieldRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const upperThumbRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const activePointer = useRef<{ id: number; index: 0 | 1; node: HTMLDivElement | null } | null>(null);
  const lastActive = useRef<0 | 1>(0);
  const [inheritedDisabled, setInheritedDisabled] = useState(false);
  const disabled = ownDisabled || inheritedDisabled;
  const [stored, setValue] = useFieldValue<number | readonly [number, number]>(controlled, initial.current,
    next => {
      if (options.range) options.onValueChange?.(next as SliderRange);
      else options.onValueChange?.(next as number);
    }, fieldRef, form);
  const grid = { min, max, step };
  const last = getSteppedValue(max, grid);
  const value = range ? getSteppedRange(typeof stored === 'number' ? [stored, last] : stored, grid)
    : getSteppedValue(typeof stored === 'number' ? stored : stored[0], grid);
  const values = typeof value === 'number' ? [value] : value;
  const position = (value: number) => last === min ? 0 : (value - min) / (last - min);
  const start = range ? position(values[0]) : 0, progress = position(values[values.length - 1]);
  function request(candidate: number, index: 0 | 1) {
    if (typeof value === 'number') {
      const next = getSteppedValue(candidate, grid);
      if (next !== value) setValue(next);
    } else {
      const next = getSteppedRange(value, grid, { index, value: candidate });
      if (next[0] !== value[0] || next[1] !== value[1]) setValue(next);
    }
  }
  function isDisabled() { return ownDisabled || !!fieldRef.current?.matches(':disabled'); }
  function stop() {
    const pointer = activePointer.current;
    activePointer.current = null;
    if (pointer?.node?.hasPointerCapture?.(pointer.id)) pointer.node.releasePointerCapture(pointer.id);
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
    const document = field.ownerDocument;
    let attached = true;
    function reset(event: Event) {
      if (event.target !== fieldRef.current?.form) return;
      queueMicrotask(() => { if (attached && event.target === fieldRef.current?.form && controlled === undefined && !event.defaultPrevented) stop(); });
    }
    document.addEventListener('reset', reset, true);
    return () => { attached = false; observer.disconnect(); document.removeEventListener('reset', reset, true); };
  });
  useEffect(() => { stop(); }, [range]);
  useEffect(() => () => stop(), []);
  function candidate(event: PointerEvent<HTMLDivElement>) {
    const rect = railRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return undefined;
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    return min + (last - min) * ratio;
  }
  const thumbs = values.map((current, number) => {
    const index = number as 0 | 1;
    const ref = index === 0 ? thumbRef : upperThumbRef;
    const thumbSlot = (Array.isArray(slotProps.thumb) ? slotProps.thumb[index] : slotProps.thumb) as ComponentPropsWithoutRef<'div'> | undefined;
    const fieldSlot = (Array.isArray(slotProps.field) ? slotProps.field[index] : slotProps.field) as ComponentPropsWithoutRef<'input'> | undefined;
    const thumbId = thumbSlot?.id ?? props.id;
    const fieldId = fieldSlot?.id;
    const thumbProps: ComponentPropsWithRef<'div'> & { 'data-slot': string; 'data-index': number } = { ...props, ...thumbSlot, ref,
      id: index === 1 && thumbId && !(Array.isArray(slotProps.thumb) && thumbSlot?.id) ? `${thumbId}-end` : thumbId,
      style: { ...thumbSlot?.style, '--dreadnought-slider-thumb-progress': `${position(current) * 100}%` } as CSSProperties,
      role: 'slider', 'data-slot': 'thumb', 'data-index': index, 'aria-orientation': 'horizontal',
      'aria-valuemin': range && index === 1 ? values[0] : min,
      'aria-valuemax': range && index === 0 ? values[1] : last, 'aria-valuenow': current,
      'aria-disabled': disabled, tabIndex: disabled ? -1 : 0,
      onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
        props.onKeyDown?.(event);
        thumbSlot?.onKeyDown?.(event);
        if (isDisabled() || event.defaultPrevented || event.nativeEvent.isComposing || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
        const direction = getNavigationDirection(event.key, { orientation: 'horizontal' })
          ?? getNavigationDirection(event.key, { homeEnd: false });
        if (!direction) return;
        event.preventDefault();
        request(direction === 'first' ? min : direction === 'last' ? last
          : current + (event.key === 'ArrowRight' || event.key === 'ArrowUp' ? step : -step), index);
      },
      onPointerDown: event => { props.onPointerDown?.(event); thumbSlot?.onPointerDown?.(event); },
      onPointerMove: event => { props.onPointerMove?.(event); thumbSlot?.onPointerMove?.(event); },
      onPointerUp: event => { props.onPointerUp?.(event); thumbSlot?.onPointerUp?.(event); },
      onPointerCancel: event => { props.onPointerCancel?.(event); thumbSlot?.onPointerCancel?.(event); },
      onLostPointerCapture: event => { props.onLostPointerCapture?.(event); thumbSlot?.onLostPointerCapture?.(event); },
      onPointerEnter: event => { props.onPointerEnter?.(event); thumbSlot?.onPointerEnter?.(event); },
      onPointerLeave: event => { props.onPointerLeave?.(event); thumbSlot?.onPointerLeave?.(event); },
      onFocus: event => { lastActive.current = index; props.onFocus?.(event); thumbSlot?.onFocus?.(event); },
      onBlur: event => { props.onBlur?.(event); thumbSlot?.onBlur?.(event); stop(); },
    };
    const fieldProps: ComponentPropsWithRef<'input'> = { ...fieldSlot, ref: index === 0 ? fieldRef : upperFieldRef,
      id: index === 1 && fieldId && !Array.isArray(slotProps.field) ? `${fieldId}-end` : fieldId,
      type: 'hidden', name, form, value: current, disabled: ownDisabled };
    return { value: current, progress: position(current), thumbRef: ref, thumbProps, fieldProps };
  });
  const rootProps: ComponentPropsWithRef<'div'> & { 'data-ui': string; 'data-disabled': string | undefined } = { ...slotProps.root, ref: rootRef,
    className: [className, slotProps.root?.className].filter(Boolean).join(' '),
    style: { ...slotProps.root?.style, ...style, '--dreadnought-slider-progress': `${progress * 100}%`,
      '--dreadnought-slider-start': `${start * 100}%` } as CSSProperties,
    'data-ui': 'slider', 'data-disabled': disabled ? '' : undefined,
    onPointerDown: event => {
      slotProps.root?.onPointerDown?.(event);
      if (isDisabled() || event.defaultPrevented || event.button !== 0 || !event.isPrimary || activePointer.current !== null) return;
      const next = candidate(event);
      if (next === undefined) return;
      let index: 0 | 1 = 0;
      if (range) {
        const pressed = thumbs.findIndex(thumb => thumb.thumbRef.current?.contains(event.target as Node));
        const lowerDistance = Math.abs(next - values[0]), upperDistance = Math.abs(next - values[1]);
        if (pressed >= 0) index = pressed as 0 | 1;
        else if (lowerDistance !== upperDistance) index = lowerDistance < upperDistance ? 0 : 1;
        else if (values[0] === values[1] && next !== values[0]) index = next > values[0] ? 1 : 0;
        else index = lastActive.current;
      }
      event.preventDefault();
      request(next, index);
      const node = thumbs[index].thumbRef.current;
      node?.focus({ preventScroll: true });
      lastActive.current = index;
      activePointer.current = { id: event.pointerId, index, node };
      node?.setPointerCapture?.(event.pointerId);
    },
    onPointerMove: event => {
      slotProps.root?.onPointerMove?.(event);
      const pointer = activePointer.current;
      if (!pointer || pointer.id !== event.pointerId) return;
      if (isDisabled()) { stop(); return; }
      const next = candidate(event);
      if (!event.defaultPrevented && next !== undefined) request(next, pointer.index);
    },
    onPointerUp: event => { slotProps.root?.onPointerUp?.(event); if (activePointer.current?.id === event.pointerId) stop(); },
    onPointerCancel: event => { slotProps.root?.onPointerCancel?.(event); if (activePointer.current?.id === event.pointerId) stop(); },
    onLostPointerCapture: event => { slotProps.root?.onLostPointerCapture?.(event); if (activePointer.current?.id === event.pointerId) stop(); },
    onBlur: event => { slotProps.root?.onBlur?.(event); stop(); },
  };
  return { value, min, max: last, progress, start, disabled, rootRef, railRef, thumbRef, fieldRef, rootProps,
    thumbs, thumbProps: thumbs[0].thumbProps, fieldProps: thumbs[0].fieldProps };
}
