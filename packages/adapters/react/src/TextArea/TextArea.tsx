import { textAreaPresentation } from '@dreadnought/ui';
import type { ComponentPropsWithRef } from 'react';
import { TextAreaAdapter } from './TextAreaAdapter.js';

export type TextAreaProps = ComponentPropsWithRef<typeof TextAreaAdapter>;

export function TextArea({ className, ...props }: TextAreaProps) {
  const classes = [textAreaPresentation.root, className].filter(Boolean).join(' ');
  return <TextAreaAdapter {...props} className={classes} />;
}
