import type { ButtonCore, ButtonCoreOptions } from './ButtonCore.js';

export function getButtonState({ disabled = false, loading = false }: ButtonCoreOptions): ButtonCore {
  return {
    disabled,
    ariaDisabled: loading && !disabled,
    busy: loading,
    actionBlocked: disabled || loading,
  };
}
