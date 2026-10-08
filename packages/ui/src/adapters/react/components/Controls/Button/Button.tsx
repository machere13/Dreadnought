import { ButtonAdapter } from '@dreadnought/react/unstyled';
import type { ButtonAdapterProps } from '@dreadnought/react/unstyled';
import { buttonPresentation } from '#presentation/Controls/Button/buttonPresentation.ts';

export type ButtonProps = ButtonAdapterProps & {
  variant?: 'primary' | 'secondary' | 'outlined' | 'ghosted';
  size?: 'default' | 'compact';
};

export function Button({
  variant = 'primary',
  size = 'default',
  className,
  ...props
}: ButtonProps) {
  const classes = [
    buttonPresentation.root,
    buttonPresentation.variants[variant],
    buttonPresentation.sizes[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (typeof props.href === 'string') {
    return <ButtonAdapter {...props} className={classes} data-variant={variant} data-size={size} />;
  }

  const { href: _href, ...actionProps } = props;
  return (
    <ButtonAdapter {...actionProps} className={classes} data-variant={variant} data-size={size} />
  );
}
