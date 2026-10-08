import { useEffect, useImperativeHandle, useRef } from 'react';
import type { ComponentPropsWithRef, ComponentPropsWithoutRef } from 'react';
import { getCheckboxState } from '@dreadnought/core';

export type CheckboxAdapterProps = Omit<ComponentPropsWithRef<'input'>, 'type'> & {
  indeterminate?: boolean;
  invalid?: boolean;
  slotProps?: {
    label?: ComponentPropsWithoutRef<'label'>;
    indicator?: ComponentPropsWithoutRef<'span'>;
  };
};

export function CheckboxAdapter({
  children,
  className,
  style,
  ref,
  indeterminate = false,
  invalid,
  slotProps = {},
  onChange,
  ...props
}: CheckboxAdapterProps) {
  const control = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => control.current!);
  useEffect(() => {
    if (control.current) {
      control.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);
  const state = getCheckboxState({
    checked: props.checked ?? props.defaultChecked,
    disabled: props.disabled,
    required: props.required,
    invalid,
    indeterminate,
  });
  return (
    <label
      {...slotProps.label}
      className={[className, slotProps.label?.className].filter(Boolean).join(' ')}
      style={style ?? slotProps.label?.style}
      data-ui="checkbox"
      data-disabled={state.disabled ? '' : undefined}
      data-invalid={state.invalid ? '' : undefined}
    >
      <input
        {...props}
        ref={control}
        type="checkbox"
        data-slot="control"
        aria-invalid={state.invalid || props['aria-invalid'] || undefined}
        aria-checked={indeterminate ? 'mixed' : props['aria-checked']}
        onChange={(event) => {
          event.currentTarget.indeterminate = indeterminate;
          onChange?.(event);
        }}
      />
      <span {...slotProps.indicator} data-slot="indicator" aria-hidden="true" />
      {children && <span data-slot="label">{children}</span>}
    </label>
  );
}
