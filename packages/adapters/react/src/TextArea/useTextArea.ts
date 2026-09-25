import { getTextAreaState } from '@dreadnought/core';
import type { TextareaHTMLAttributes } from 'react';

export interface UseTextAreaOptions extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function useTextArea({
  disabled,
  readOnly,
  required,
  invalid,
  ...rest
}: UseTextAreaOptions = {}) {
  const state = getTextAreaState({ disabled, readOnly, required, invalid });
  const textAreaProps = {
    ...rest,
    disabled: state.disabled,
    readOnly: state.readOnly,
    required: state.required,
    'aria-invalid': state.invalid ? true : rest['aria-invalid'],
    'data-invalid': state.invalid ? '' : undefined,
  };

  return { textAreaProps, state };
}
