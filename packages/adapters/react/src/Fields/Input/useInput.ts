import { getInputState } from '@dreadnought/core';
import { useState } from 'react';
import type { InputHTMLAttributes } from 'react';

export type TextInputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';

export interface UseInputOptions extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: TextInputType;
  invalid?: boolean;
  passwordVisibilityLabels?: { show: string; hide: string };
}

export function useInput({
  type = 'text',
  disabled,
  readOnly,
  required,
  invalid,
  passwordVisibilityLabels,
  ...rest
}: UseInputOptions = {}) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const state = getInputState({ disabled, readOnly, required, invalid });
  const isPassword = type === 'password';
  const visibilityLabel = passwordVisible
    ? (passwordVisibilityLabels?.hide ?? 'Hide password')
    : (passwordVisibilityLabels?.show ?? 'Show password');
  const inputProps = {
    ...rest,
    type: isPassword && passwordVisible ? 'text' : type,
    disabled: state.disabled,
    readOnly: state.readOnly,
    required: state.required,
    'aria-invalid': state.invalid ? true : rest['aria-invalid'],
    'data-invalid': state.invalid ? '' : undefined,
  };

  const visibilityButtonProps = isPassword ? {
    type: 'button' as const,
    disabled: state.disabled,
    'aria-label': visibilityLabel,
    onClick: () => setPasswordVisible((visible) => !visible),
    children: visibilityLabel,
  } : undefined;

  return { inputProps, state, visibilityButtonProps, isPasswordVisible: isPassword && passwordVisible };
}
