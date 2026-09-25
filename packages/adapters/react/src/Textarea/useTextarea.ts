import { getTextareaState } from '@dreadnought/core';
import type { TextareaHTMLAttributes } from 'react';

export interface UseTextareaOptions extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function useTextarea({
  disabled,
  readOnly,
  required,
  invalid,
  ...rest
}: UseTextareaOptions = {}) {
  const state = getTextareaState({ disabled, readOnly, required, invalid });
  const textareaProps = {
    ...rest,
    disabled: state.disabled,
    readOnly: state.readOnly,
    required: state.required,
    'aria-invalid': state.invalid ? true : rest['aria-invalid'],
    'data-invalid': state.invalid ? '' : undefined,
  };

  return { textareaProps, state };
}
