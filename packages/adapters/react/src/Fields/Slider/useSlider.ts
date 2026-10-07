import { useEffect, useRef, useState } from 'react';
import type { ComponentPropsWithRef, ComponentPropsWithoutRef, CSSProperties, KeyboardEvent, PointerEvent } from 'react';
import { getNavigationDirection, getNextEnabledValue, getSteppedRange, getSteppedValue } from '@dreadnought/core';
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
  const { min = 0, max = 100, step = 1, marks = {}, range = false, orientation = 'horizontal', value: controlled, defaultValue, disabled: ownDisabled = false,
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
  const points = Object.keys(marks).map(Number).sort((a, b) => a - b);
  const grid = { min, max, step, points };
  const first = getSteppedValue(min, grid);
  const last = getSteppedValue(max, grid);
  const value = range ? getSteppedRange(typeof stored === 'number' ? [stored, last] : stored, grid)
    : getSteppedValue(typeof stored === 'number' ? stored : stored[0], grid);
  const values = typeof value === 'number' ? [value] : value;
  const scaleMax = step === null ? max : last;
  const position = (value: number) => scaleMax === min ? 0 : (value - min) / (scaleMax - min);
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
  function nearestThumb(next: number) {
    if (!range) return 0;
    const lowerDistance = Math.abs(next - values[0]), upperDistance = Math.abs(next - values[1]);
    if (lowerDistance !== upperDistance) return lowerDistance < upperDistance ? 0 : 1;
    if (values[0] === values[1] && next !== values[0]) return next > values[0] ? 1 : 0;
    return lastActive.current;
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
  useEffect(() => { stop(); }, [range, orientation]);
  useEffect(() => () => stop(), []);
  function candidate(event: PointerEvent<HTMLDivElement>) {
    const rect = railRef.current?.getBoundingClientRect();
    if (!rect || (orientation === 'vertical' ? rect.height : rect.width) <= 0) return undefined;
    const ratio = Math.max(0, Math.min(1, orientation === 'vertical'
      ? 1 - (event.clientY - rect.top) / rect.height : (event.clientX - rect.left) / rect.width));
    return min + (scaleMax - min) * ratio;
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
      role: 'slider', 'data-slot': 'thumb', 'data-index': index, 'aria-orientation': orientation,
      'aria-valuemin': range && index === 1 ? values[0] : first,
      'aria-valuemax': range && index === 0 ? values[1] : last, 'aria-valuenow': current,
      'aria-disabled': disabled, tabIndex: disabled ? -1 : 0,
      onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
        props.onKeyDown?.(event);
        thumbSlot?.onKeyDown?.(event);
        if (isDisabled() || event.defaultPrevented || event.nativeEvent.isComposing || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
        const direction = getNavigationDirection(event.key, { orientation })
          ?? (orientation === 'horizontal' ? getNavigationDirection(event.key, { homeEnd: false }) : undefined);
        if (!direction) return;
        event.preventDefault();
        const increase = event.key === 'ArrowRight' || event.key === 'ArrowUp';
        const next = step === null ? Number(getNextEnabledValue(points.filter(point => point >= min && point <= max)
          .map(point => ({ value: String(point) })), String(current), direction === 'first' || direction === 'last'
            ? direction : increase ? 'next' : 'previous', { loop: false }))
          : direction === 'first' ? first : direction === 'last' ? last : current + (increase ? step : -step);
        request(next, index);
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
  const rootProps: ComponentPropsWithRef<'div'> & { 'data-ui': string; 'data-disabled': string | undefined; 'data-orientation': string } = { ...slotProps.root, ref: rootRef,
    className: [className, slotProps.root?.className].filter(Boolean).join(' '),
    style: { ...slotProps.root?.style, ...style, '--dreadnought-slider-progress': `${progress * 100}%`,
      '--dreadnought-slider-start': `${start * 100}%` } as CSSProperties,
    'data-ui': 'slider', 'data-disabled': disabled ? '' : undefined, 'data-orientation': orientation,
    onPointerDown: event => {
      slotProps.root?.onPointerDown?.(event);
      if (isDisabled() || event.defaultPrevented || event.button !== 0 || !event.isPrimary || activePointer.current !== null) return;
      const next = candidate(event);
      if (next === undefined) return;
      const pressed = thumbs.findIndex(thumb => thumb.thumbRef.current?.contains(event.target as Node));
      const index = pressed >= 0 ? pressed as 0 | 1 : nearestThumb(next);
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
  const markBindings = points.filter(point => point >= min && point <= max).map(point => {
    const markProps: ComponentPropsWithoutRef<'button'> & { 'data-slot': string; 'data-active': string | undefined } = {
      ...slotProps.mark, id: slotProps.mark?.id ? `${slotProps.mark.id}-${point}` : undefined,
      type: 'button', tabIndex: -1, disabled,
      'data-slot': 'mark', 'data-active': point >= (range ? values[0] : first) && point <= values[values.length - 1] ? '' : undefined,
      style: { ...slotProps.mark?.style, '--dreadnought-slider-mark-progress': `${position(point) * 100}%` } as CSSProperties,
      onPointerDown: event => { slotProps.mark?.onPointerDown?.(event); event.stopPropagation(); },
      onClick: event => {
        slotProps.mark?.onClick?.(event);
        if (event.defaultPrevented || isDisabled()) return;
        stop();
        const index = nearestThumb(point);
        request(point, index);
        thumbs[index].thumbRef.current?.focus({ preventScroll: true });
        lastActive.current = index;
      },
    };
    return { value: point, label: marks[point], markProps };
  });
  return { value, min: first, max: last, progress, start, disabled, rootRef, railRef, thumbRef, fieldRef, rootProps, marks: markBindings,
    thumbs, thumbProps: thumbs[0].thumbProps, fieldProps: thumbs[0].fieldProps };
}
