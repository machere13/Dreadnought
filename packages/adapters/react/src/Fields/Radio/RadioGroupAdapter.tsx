import { useId, useImperativeHandle, useRef } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { RadioAdapter } from './RadioAdapter.tsx';
import type { RadioAdapterProps } from './RadioAdapter.tsx';
import { useFieldValue } from '../../shared/useFieldValue.ts';

export interface RadioOption { value: string; label: ReactNode; disabled?: boolean }
export type RadioGroupAdapterProps = Omit<ComponentPropsWithRef<'fieldset'>, 'onChange' | 'defaultValue' | 'children'> & {
  label?: ReactNode;
  options: readonly RadioOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  required?: boolean;
  slotProps?: { item?: Omit<RadioAdapterProps, 'checked' | 'defaultChecked' | 'value' | 'children'> };
};
export function RadioGroupAdapter({ label, options, value, defaultValue = '', onValueChange, name, disabled, required, ref, slotProps, ...props }: RadioGroupAdapterProps) {
  const generatedName = useId();
  const root = useRef<HTMLFieldSetElement>(null);
  useImperativeHandle(ref, () => root.current!);
  const [selected, setValue] = useFieldValue(value, defaultValue, onValueChange, root);
  if (new Set(options.map(o => o.value)).size !== options.length) throw new Error('Radio option values must be unique.');
  return <fieldset {...props} ref={root} name={name} role="radiogroup" disabled={disabled} data-ui="radio-group">
    {label && <legend>{label}</legend>}
    {options.map(option => <RadioAdapter {...slotProps?.item} key={option.value} name={name ?? generatedName} form={props.form} value={option.value}
      disabled={disabled || option.disabled} required={required} checked={selected === option.value} onChange={event => {
        slotProps?.item?.onChange?.(event);
        if (!event.defaultPrevented) setValue(option.value);
      }}>{option.label}</RadioAdapter>)}
  </fieldset>;
}
