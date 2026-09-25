import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { useButton } from './useButton.js';
import type { UseButtonOptions } from './useButton.js';

export interface ButtonAdapterProps extends UseButtonOptions {
  icon?: ReactNode;
  iconPosition?: 'start' | 'end';
}

export const ButtonAdapter = forwardRef<HTMLButtonElement, ButtonAdapterProps>(
  function ButtonAdapter({ children, icon, iconPosition = 'start', ...options }, ref) {
    const { buttonProps } = useButton(options);
    const iconSlot = icon == null ? null : <span data-slot="icon" aria-hidden="true">{icon}</span>;

    return (
      <button {...buttonProps} data-ui="button" ref={ref}>
        {iconPosition === 'start' && iconSlot}
        {children != null && <span data-slot="label">{children}</span>}
        {iconPosition === 'end' && iconSlot}
      </button>
    );
  },
);
