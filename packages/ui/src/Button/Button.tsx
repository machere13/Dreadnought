import { forwardRef } from 'react';
import { ButtonAdapter } from '@dreadnought/react/unstyled';
import type { ButtonAdapterProps } from '@dreadnought/react/unstyled';

export interface ButtonProps extends ButtonAdapterProps {
  variant?: 'primary' | 'secondary';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = 'primary', ...props }, ref) {
    return <ButtonAdapter {...props} data-variant={variant} ref={ref} />;
  },
);
