import { forwardRef } from 'react';
import { useInput } from './useInput.js';
import type { UseInputOptions } from './useInput.js';

export type InputAdapterProps = UseInputOptions;

export const InputAdapter = forwardRef<HTMLInputElement, InputAdapterProps>(
  function InputAdapter({ className, style, ...options }, ref) {
    const { inputProps, state, visibilityButtonProps } = useInput(options);
    const isInvalid = state.invalid || inputProps['aria-invalid'] === true || inputProps['aria-invalid'] === 'true';

    return (
      <div
        className={className}
        style={style}
        data-ui="input"
        data-invalid={isInvalid ? '' : undefined}
        data-disabled={state.disabled ? '' : undefined}
      >
        <input
          {...inputProps}
          data-slot="control"
          ref={ref}
        />
        {visibilityButtonProps && (
          <button
            {...visibilityButtonProps}
            data-slot="visibility-toggle"
          />
        )}
      </div>
    );
  },
);
