import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEventHandler } from 'react';
import { getNavigationDirection, getTextFieldState } from '@dreadnought/core';

export function NumberFieldProbe({
  defaultValue,
  min,
  max,
  step = 1,
  disabled,
  readOnly,
  required,
  onKeyDown,
}: {
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
}) {
  const id = useId();
  const control = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue === undefined ? '' : String(defaultValue));
  const [invalid, setInvalid] = useState(false);
  const state = getTextFieldState({ disabled, readOnly, required, invalid });
  function sync() {
    if (!control.current) {
      return;
    }
    setValue(control.current.value);
    setInvalid(!control.current.validity.valid);
  }
  useLayoutEffect(sync, [defaultValue, min, max, step, disabled, readOnly, required]);
  useEffect(() => {
    const form = control.current?.form;
    function reset(event: Event) {
      queueMicrotask(() => {
        if (!event.defaultPrevented) {
          sync();
        }
      });
    }
    form?.addEventListener('reset', reset);
    return () => form?.removeEventListener('reset', reset);
  }, []);
  function change(increase: boolean) {
    const node = control.current;
    if (!node || node.matches(':disabled') || node.readOnly) {
      return;
    }
    if (increase) {
      node.stepUp();
    } else {
      node.stepDown();
    }
    sync();
    node.focus();
  }
  return (
    <div>
      <label htmlFor={id}>Quantity</label>
      <input
        id={id}
        ref={control}
        type="number"
        name="quantity"
        defaultValue={defaultValue}
        min={min}
        max={max}
        step={step}
        disabled={state.disabled}
        readOnly={state.readOnly}
        required={state.required}
        aria-invalid={state.invalid}
        onChange={sync}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (
            event.defaultPrevented ||
            event.nativeEvent.isComposing ||
            event.ctrlKey ||
            event.altKey ||
            event.metaKey ||
            event.shiftKey ||
            event.currentTarget.matches(':disabled') ||
            event.currentTarget.readOnly
          ) {
            return;
          }
          const direction = getNavigationDirection(event.key, { homeEnd: false });
          if (!direction) {
            return;
          }
          event.preventDefault();
          change(direction === 'previous');
        }}
      />
      <button
        type="button"
        disabled={state.disabled || state.readOnly}
        onClick={() => change(false)}
      >
        Decrease
      </button>
      <button
        type="button"
        disabled={state.disabled || state.readOnly}
        onClick={() => change(true)}
      >
        Increase
      </button>
      <output role="status" aria-label="Current value">
        {value}
      </output>
    </div>
  );
}
