import { getInputState, getNavigationDirection } from '@dreadnought/core';
import { useLayoutEffect, useRef, useState } from 'react';
import type { InputHTMLAttributes, KeyboardEvent } from 'react';

export type TextInputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';
export type InputType = TextInputType | 'number';

export interface UseInputOptions extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: InputType;
  invalid?: boolean;
  passwordVisibilityLabels?: { show: string; hide: string };
  stepButtonLabels?: { decrease: string; increase: string };
  allowClear?: boolean;
  clearLabel?: string;
  showCount?: boolean;
}

export function useInput({
  type = 'text',
  disabled,
  readOnly,
  required,
  invalid,
  passwordVisibilityLabels,
  stepButtonLabels,
  allowClear = false,
  clearLabel = 'Clear input',
  showCount = false,
  ...rest
}: UseInputOptions = {}) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const control = useRef<HTMLInputElement>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState(String(rest.defaultValue ?? ''));
  const value = rest.value === undefined ? uncontrolledValue : String(rest.value);
  useLayoutEffect(() => {
    const node = control.current;
    if (!node || (!allowClear && !showCount)) return;
    const form = node.form;
    let active = true;
    const update = () => setUncontrolledValue(node.value);
    const reset = (event: Event) => {
      queueMicrotask(() => {
        if (active && !event.defaultPrevented && node.form === form) update();
      });
    };
    update();
    node.addEventListener('input', update);
    form?.addEventListener('reset', reset);
    return () => {
      active = false;
      node.removeEventListener('input', update);
      form?.removeEventListener('reset', reset);
    };
  });
  const state = getInputState({ disabled, readOnly, required, invalid });
  const isPassword = type === 'password';
  const canStep = type === 'number' && rest.step !== 'any';
  function changeStep(increase: boolean) {
    const node = control.current;
    if (!canStep || !node || node.matches(':disabled') || node.readOnly) {
      return;
    }
    const previous = node.value;
    if (increase) {
      node.stepUp();
    } else {
      node.stepDown();
    }
    if (node.value !== previous) {
      node.dispatchEvent(new node.ownerDocument.defaultView!.Event('input', { bubbles: true }));
    }
    node.focus({ preventScroll: true });
  }
  const visibilityLabel = passwordVisible
    ? (passwordVisibilityLabels?.hide ?? 'Hide password')
    : (passwordVisibilityLabels?.show ?? 'Show password');
  const inputProps = {
    ...rest,
    ref: control,
    type: isPassword && passwordVisible ? 'text' : type,
    disabled: state.disabled,
    readOnly: state.readOnly,
    required: state.required,
    'aria-invalid': state.invalid ? true : rest['aria-invalid'],
    'data-invalid': state.invalid ? '' : undefined,
    onKeyDown: canStep
      ? (event: KeyboardEvent<HTMLInputElement>) => {
          rest.onKeyDown?.(event);
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
          changeStep(direction === 'previous');
        }
      : rest.onKeyDown,
  };

  const visibilityButtonProps = isPassword
    ? {
        type: 'button' as const,
        disabled: state.disabled,
        'aria-label': visibilityLabel,
        onClick: () => setPasswordVisible((visible) => !visible),
        children: visibilityLabel,
      }
    : undefined;

  const clearButtonProps =
    allowClear && value && !state.disabled && !state.readOnly
      ? {
          type: 'button' as const,
          'aria-label': clearLabel,
          onClick: () => {
            const node = control.current;
            if (!node || node.matches(':disabled') || node.readOnly || !node.value) return;
            Object.getOwnPropertyDescriptor(Object.getPrototypeOf(node), 'value')!.set!.call(
              node,
              '',
            );
            node.dispatchEvent(
              new node.ownerDocument.defaultView!.Event('input', { bubbles: true }),
            );
            node.focus({ preventScroll: true });
          },
        }
      : undefined;

  const stepButtonProps = canStep
    ? {
        decrease: {
          type: 'button' as const,
          disabled: state.disabled || state.readOnly,
          'aria-label': stepButtonLabels?.decrease ?? 'Decrease value',
          'data-slot': 'step-decrease',
          onClick: () => changeStep(false),
          children: '−',
        },
        increase: {
          type: 'button' as const,
          disabled: state.disabled || state.readOnly,
          'aria-label': stepButtonLabels?.increase ?? 'Increase value',
          'data-slot': 'step-increase',
          onClick: () => changeStep(true),
          children: '+',
        },
      }
    : undefined;

  return {
    inputProps,
    state,
    visibilityButtonProps,
    stepButtonProps,
    isPasswordVisible: isPassword && passwordVisible,
    clearButtonProps,
    count: value.length,
  };
}
