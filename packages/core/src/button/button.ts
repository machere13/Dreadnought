import type { ButtonState, ButtonStateInput } from './button.types.js';

export function getButtonState({ disabled = false, loading = false }: ButtonStateInput): ButtonState {
  return {
    nativeDisabled: disabled,
    ariaDisabled: loading && !disabled,
    busy: loading,
    actionBlocked: disabled || loading,
  };
}
