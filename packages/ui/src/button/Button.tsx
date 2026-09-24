import { forwardRef } from 'react';
import { ButtonBase } from '@morpha/react/unstyled';
import type { ButtonBaseProps } from '@morpha/react/unstyled';

export interface ButtonProps extends ButtonBaseProps {
  variant?: 'primary' | 'secondary';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = 'primary', ...props }, ref) {
    return <ButtonBase {...props} data-variant={variant} ref={ref} />;
  },
);
