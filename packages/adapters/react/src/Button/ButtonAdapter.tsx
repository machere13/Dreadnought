import { forwardRef } from 'react';
import { useButton } from './useButton.js';
import type { UseButtonOptions } from './useButton.js';

export type ButtonAdapterProps = UseButtonOptions;

export const ButtonAdapter = forwardRef<HTMLButtonElement, ButtonAdapterProps>(
  function ButtonAdapter({ children, ...options }, ref) {
    const { buttonProps } = useButton(options);

    return (
      <button {...buttonProps} data-ui="button" ref={ref}>
        <span data-slot="label">{children}</span>
      </button>
    );
  },
);
