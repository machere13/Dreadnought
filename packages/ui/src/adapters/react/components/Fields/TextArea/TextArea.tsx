import { textAreaPresentation } from '#presentation/Fields/TextArea/textAreaPresentation.ts';
import type { ComponentPropsWithRef, CSSProperties } from 'react';
import { TextAreaAdapter } from '@dreadnought/react/unstyled';

export type TextAreaProps = ComponentPropsWithRef<typeof TextAreaAdapter>;

export function TextArea({ className, style, ...props }: TextAreaProps) {
  const classes = [textAreaPresentation.root, className].filter(Boolean).join(' ');
  const bounds = {
    ...style,
    '--dreadnought-text-area-min-rows': !props.autoSize && (props.minRows !== undefined || props.maxRows !== undefined)
      ? Math.min(props.minRows ?? 1, props.maxRows ?? Infinity) : undefined,
    '--dreadnought-text-area-max-rows': props.autoSize ? undefined : props.maxRows,
  } as CSSProperties;
  return <TextAreaAdapter {...props} style={bounds} className={classes} />;
}
