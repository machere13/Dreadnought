import type { ButtonCore, ButtonCoreOptions } from './ButtonCore.ts';

export function getButtonState({ disabled = false, loading = false }: ButtonCoreOptions): ButtonCore {
  return {
    disabled,
    ariaDisabled: loading && !disabled,
    busy: loading,
    actionBlocked: disabled || loading,
  };
}
