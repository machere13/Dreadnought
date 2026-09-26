import { ButtonAdapter } from '@dreadnought/react/unstyled';
import type { ButtonAdapterProps } from '@dreadnought/react/unstyled';
import { buttonPresentation } from '../../../presentation/Button/buttonPresentation.js';

export type ButtonProps = ButtonAdapterProps & {
  variant?: 'primary' | 'secondary';
};

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  const classes = [buttonPresentation.root, buttonPresentation.variants[variant], className]
    .filter(Boolean)
    .join(' ');

  if (typeof props.href === 'string') {
    return <ButtonAdapter {...props} className={classes} data-variant={variant} />;
  }

  const { href: _href, ...actionProps } = props;
  return <ButtonAdapter {...actionProps} className={classes} data-variant={variant} />;
}
