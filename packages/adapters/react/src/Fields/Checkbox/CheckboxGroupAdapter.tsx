import { useImperativeHandle, useRef } from 'react';
import { getSelectionValue } from '@dreadnought/core';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { CheckboxAdapter } from './CheckboxAdapter.tsx';
import type { CheckboxAdapterProps } from './CheckboxAdapter.tsx';
import { useFieldValue } from '../../shared/useFieldValue.ts';

export interface CheckboxOption { value: string; label: ReactNode; disabled?: boolean }
export type CheckboxGroupAdapterProps = Omit<ComponentPropsWithRef<'fieldset'>, 'onChange' | 'defaultValue' | 'children'> & {
  label?: ReactNode;
  options: readonly CheckboxOption[];
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: string[]) => void;
  slotProps?: { item?: Omit<CheckboxAdapterProps, 'checked' | 'defaultChecked' | 'value' | 'children'> };
};
const empty: string[] = [];
export function CheckboxGroupAdapter({ label, options, value, defaultValue = empty, onValueChange, name, disabled, ref, slotProps, ...props }: CheckboxGroupAdapterProps) {
  const root = useRef<HTMLFieldSetElement>(null);
  useImperativeHandle(ref, () => root.current!);
  const [selected, setValue] = useFieldValue<readonly string[]>(value, defaultValue, next => onValueChange?.([...next]), root, props.form);
  if (new Set(options.map(o => o.value)).size !== options.length) throw new Error('Checkbox option values must be unique.');
  return <fieldset {...props} ref={root} name={name} disabled={disabled} data-ui="checkbox-group">
    {label && <legend>{label}</legend>}
    {options.map(option => <CheckboxAdapter {...slotProps?.item} key={option.value} name={name} form={props.form} value={option.value}
      disabled={disabled || option.disabled} checked={selected.includes(option.value)} onChange={event => {
        slotProps?.item?.onChange?.(event);
        if (!event.defaultPrevented) setValue(getSelectionValue(selected,
          { type: event.currentTarget.checked ? 'select' : 'deselect', value: option.value },
          { disabled: disabled || option.disabled }));
      }}>{option.label}</CheckboxAdapter>)}
  </fieldset>;
}
