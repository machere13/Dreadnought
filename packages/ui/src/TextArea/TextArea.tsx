import { TextAreaAdapter } from '@dreadnought/react/unstyled';
import type { ComponentPropsWithRef } from 'react';
import styles from './TextArea.module.css';

export type TextAreaProps = ComponentPropsWithRef<typeof TextAreaAdapter>;

export function TextArea({ className, ...props }: TextAreaProps) {
  const classes = ['dreadnought-text-text-area', styles.textArea, className].filter(Boolean).join(' ');
  return <TextAreaAdapter {...props} className={classes} />;
}
