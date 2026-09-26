import { textAreaPresentation } from '#presentation/Fields/TextArea/textAreaPresentation.ts';
import type { ComponentPropsWithRef } from 'react';
import { TextAreaAdapter } from '@dreadnought/react/unstyled';

export type TextAreaProps = ComponentPropsWithRef<typeof TextAreaAdapter>;

export function TextArea({ className, ...props }: TextAreaProps) {
  const classes = [textAreaPresentation.root, className].filter(Boolean).join(' ');
  return <TextAreaAdapter {...props} className={classes} />;
}
