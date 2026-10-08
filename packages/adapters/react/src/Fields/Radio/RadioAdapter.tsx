import type { ComponentPropsWithRef, ComponentPropsWithoutRef } from 'react';
import { getRadioState } from '@dreadnought/core';

export type RadioAdapterProps = Omit<ComponentPropsWithRef<'input'>, 'type'> & {
  invalid?: boolean;
  slotProps?: {
    label?: ComponentPropsWithoutRef<'label'>;
    indicator?: ComponentPropsWithoutRef<'span'>;
  };
};
export function RadioAdapter({
  children,
  className,
  style,
  invalid,
  slotProps = {},
  ...props
}: RadioAdapterProps) {
  const state = getRadioState({
    checked: props.checked ?? props.defaultChecked,
    disabled: props.disabled,
    required: props.required,
    invalid,
  });
  return (
    <label
      {...slotProps.label}
      className={[className, slotProps.label?.className].filter(Boolean).join(' ')}
      style={style ?? slotProps.label?.style}
      data-ui="radio"
      data-disabled={state.disabled ? '' : undefined}
      data-invalid={state.invalid ? '' : undefined}
    >
      <input
        {...props}
        type="radio"
        data-slot="control"
        aria-invalid={state.invalid || props['aria-invalid'] || undefined}
      />
      <span {...slotProps.indicator} data-slot="indicator" aria-hidden="true" />
      {children && <span data-slot="label">{children}</span>}
    </label>
  );
}
