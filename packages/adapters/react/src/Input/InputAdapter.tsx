import { forwardRef } from 'react';
import { useInput } from './useInput.js';
import type { UseInputOptions } from './useInput.js';

export type InputAdapterProps = UseInputOptions;

export const InputAdapter = forwardRef<HTMLInputElement, InputAdapterProps>(
  function InputAdapter(options, ref) {
    const { inputProps } = useInput(options);
    return <input {...inputProps} data-ui="input" ref={ref} />;
  },
);
