import { TextareaAdapter } from '@dreadnought/react/unstyled';
import type { ComponentPropsWithRef } from 'react';
import styles from './Textarea.module.css';

export type TextareaProps = ComponentPropsWithRef<typeof TextareaAdapter>;

export function Textarea({ className, ...props }: TextareaProps) {
  const classes = ['dreadnought-text-textarea', styles.textarea, className].filter(Boolean).join(' ');
  return <TextareaAdapter {...props} className={classes} />;
}
