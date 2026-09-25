import { InputAdapter } from '@dreadnought/react/unstyled';
import type { ComponentPropsWithRef } from 'react';
import styles from './Input.module.css';

export type InputProps = ComponentPropsWithRef<typeof InputAdapter>;

export function Input({ className, ...props }: InputProps) {
  const classes = ['dreadnought-text-input', styles.input, className].filter(Boolean).join(' ');
  return <InputAdapter {...props} className={classes} />;
}
