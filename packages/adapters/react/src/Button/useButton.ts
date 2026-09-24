import { getButtonState } from '@morpha/core';
import type { ButtonHTMLAttributes, MouseEvent } from 'react';

export interface UseButtonOptions extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  disabled?: boolean;
  loading?: boolean;
}

export function useButton({
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  ...rest
}: UseButtonOptions = {}) {
  const state = getButtonState({ disabled, loading });

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (state.actionBlocked) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    onClick?.(event);
  }

  const buttonProps = {
    ...rest,
    type,
    disabled: state.nativeDisabled,
    'aria-disabled': state.ariaDisabled || undefined,
    'aria-busy': state.busy || undefined,
    'data-loading': state.busy ? '' : undefined,
    onClick: handleClick,
  };

  return { buttonProps, state };
}
