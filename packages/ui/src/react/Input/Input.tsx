import { inputPresentation } from '../../Input/inputPresentation.js';
import type { ComponentPropsWithRef } from 'react';
import { InputAdapter } from '@dreadnought/react/unstyled';

export type InputProps = ComponentPropsWithRef<typeof InputAdapter>;

export function Input({ className, ...props }: InputProps) {
  const classes = [inputPresentation.root, className].filter(Boolean).join(' ');
  return <InputAdapter {...props} className={classes} />;
}
