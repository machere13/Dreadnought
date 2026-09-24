import { forwardRef } from 'react';
import { useButton } from './use-button.js';
import type { UseButtonOptions } from './use-button.js';

export type ButtonBaseProps = UseButtonOptions;

export const ButtonBase = forwardRef<HTMLButtonElement, ButtonBaseProps>(
  function ButtonBase({ children, ...options }, ref) {
    const { buttonProps } = useButton(options);

    return (
      <button {...buttonProps} data-ui="button" ref={ref}>
        <span data-slot="label">{children}</span>
      </button>
    );
  },
);
