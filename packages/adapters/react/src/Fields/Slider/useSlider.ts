import { useRef } from 'react';
import type { ComponentPropsWithRef, KeyboardEvent } from 'react';
import { getNavigationDirection, getSteppedValue } from '@dreadnought/core';
import { useFieldValue } from '../../shared/useFieldValue.ts';
import type { UseSliderOptions } from './slider.types.ts';

export function useSlider({ min = 0, max = 100, step = 1, value: controlled, defaultValue, disabled = false,
  onValueChange, name, form, className, style, slotProps = {}, ...props }: UseSliderOptions = {}) {
  const initial = useRef(defaultValue ?? min);
  const fieldRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [stored, setValue] = useFieldValue(controlled, initial.current, onValueChange, fieldRef, form);
  const grid = { min, max, step };
  const value = getSteppedValue(stored, grid);
  const last = getSteppedValue(max, grid);
  const progress = last === min ? 0 : (value - min) / (last - min);
  function request(candidate: number) {
    const next = getSteppedValue(candidate, grid);
    if (next !== value) setValue(next);
  }
  const thumbProps: ComponentPropsWithRef<'div'> & { 'data-slot': string } = { ...props, ...slotProps.thumb, ref: thumbRef,
    role: 'slider', 'data-slot': 'thumb', 'aria-orientation': 'horizontal', 'aria-valuemin': min,
    'aria-valuemax': last, 'aria-valuenow': value, 'aria-disabled': disabled, tabIndex: disabled ? -1 : 0,
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
      props.onKeyDown?.(event);
      slotProps.thumb?.onKeyDown?.(event);
      if (disabled || event.defaultPrevented || event.nativeEvent.isComposing || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
      const direction = getNavigationDirection(event.key, { orientation: 'horizontal' })
        ?? getNavigationDirection(event.key, { homeEnd: false });
      if (!direction) return;
      event.preventDefault();
      request(direction === 'first' ? min : direction === 'last' ? last
        : value + (event.key === 'ArrowRight' || event.key === 'ArrowUp' ? step : -step));
    },
  };
  const rootProps: ComponentPropsWithRef<'div'> & { 'data-ui': string; 'data-disabled': string | undefined } = { ...slotProps.root, ref: rootRef, className: [className, slotProps.root?.className].filter(Boolean).join(' '),
    style: { ...slotProps.root?.style, ...style }, 'data-ui': 'slider', 'data-disabled': disabled ? '' : undefined };
  const fieldProps: ComponentPropsWithRef<'input'> = { ...slotProps.field, ref: fieldRef,
    type: 'hidden', name, form, value, disabled };
  return { value, min, max: last, progress, disabled, rootRef, railRef, thumbRef, fieldRef, rootProps, thumbProps, fieldProps };
}
