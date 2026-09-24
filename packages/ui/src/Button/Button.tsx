import { forwardRef } from 'react';
import { ButtonBase } from '@dreadnought/react/unstyled';
import type { ButtonBaseProps } from '@dreadnought/react/unstyled';

export interface ButtonProps extends ButtonBaseProps {
  variant?: 'primary' | 'secondary';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = 'primary', ...props }, ref) {
    return <ButtonBase {...props} data-variant={variant} ref={ref} />;
  },
);
