import { getInputState } from '@dreadnought/core';
import type { InputHTMLAttributes } from 'react';

export type TextInputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';

export interface UseInputOptions extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: TextInputType;
  invalid?: boolean;
}

export function useInput({
  type = 'text',
  disabled,
  readOnly,
  required,
  invalid,
  ...rest
}: UseInputOptions = {}) {
  const state = getInputState({ disabled, readOnly, required, invalid });
  const inputProps = {
    ...rest,
    type,
    disabled: state.disabled,
    readOnly: state.readOnly,
    required: state.required,
    'aria-invalid': state.invalid ? true : rest['aria-invalid'],
    'data-invalid': state.invalid ? '' : undefined,
  };

  return { inputProps, state };
}
