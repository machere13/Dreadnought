import { ButtonAdapter } from '@dreadnought/react/unstyled';
import type { ButtonAdapterProps } from '@dreadnought/react/unstyled';

export type ButtonProps = ButtonAdapterProps & {
  variant?: 'primary' | 'secondary';
};

export function Button({ variant = 'primary', ...props }: ButtonProps) {
  if (typeof props.href === 'string') {
    return <ButtonAdapter {...props} data-variant={variant} />;
  }

  const { href: _href, ...actionProps } = props;
  return <ButtonAdapter {...actionProps} data-variant={variant} />;
}
