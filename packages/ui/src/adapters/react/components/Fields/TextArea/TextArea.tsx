import { textAreaPresentation } from '#presentation/Fields/TextArea/textAreaPresentation.ts';
import type { ComponentPropsWithRef, CSSProperties } from 'react';
import { TextAreaAdapter } from '@dreadnought/react/unstyled';
import { Icon } from '../../DataDisplay/Icon/Icon.tsx';

export type TextAreaProps = ComponentPropsWithRef<typeof TextAreaAdapter> & {
  controlSize?: 'default' | 'compact';
  variant?: 'outlined' | 'filled' | 'borderless';
};

export function TextArea({
  className,
  style,
  controlSize = 'default',
  variant = 'outlined',
  ...props
}: TextAreaProps) {
  const classes = [
    textAreaPresentation.root,
    textAreaPresentation.sizes[controlSize],
    textAreaPresentation.variants[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const bounds = {
    ...style,
    '--dreadnought-text-area-min-rows':
      !props.autoSize && (props.minRows !== undefined || props.maxRows !== undefined)
        ? Math.min(props.minRows ?? 1, props.maxRows ?? Infinity)
        : undefined,
    '--dreadnought-text-area-max-rows': props.autoSize ? undefined : props.maxRows,
  } as CSSProperties;
  return (
    <TextAreaAdapter
      {...props}
      clearContent={props.clearContent ?? <Icon name="close-circle" />}
      style={bounds}
      className={classes}
    />
  );
}
