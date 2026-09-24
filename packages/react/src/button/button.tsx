import { forwardRef } from 'react';
import { ButtonBase } from './button-base.js';
import type { ButtonBaseProps } from './button-base.js';

export interface ButtonProps extends ButtonBaseProps {
  variant?: 'primary' | 'secondary';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = 'primary', ...props }, ref) {
    return <ButtonBase {...props} data-variant={variant} ref={ref} />;
  },
);
