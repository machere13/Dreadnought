import type { ComponentPropsWithRef, ComponentPropsWithoutRef } from 'react';
import { getCheckableState } from '@dreadnought/core';

export type SwitchAdapterProps = Omit<ComponentPropsWithRef<'input'>, 'type' | 'role' | 'aria-checked'> & {
  invalid?: boolean;
  slotProps?: { label?: ComponentPropsWithoutRef<'label'>; indicator?: ComponentPropsWithoutRef<'span'> };
};

export function SwitchAdapter({ children, className, style, invalid, slotProps = {}, ...props }: SwitchAdapterProps) {
  const state = getCheckableState({ disabled: props.disabled, invalid });
  return <label {...slotProps.label} className={[className, slotProps.label?.className].filter(Boolean).join(' ')} style={style ?? slotProps.label?.style}
    data-ui="switch" data-disabled={state.disabled ? '' : undefined} data-invalid={state.invalid ? '' : undefined}>
    <input {...props} type="checkbox" role="switch" data-slot="control" aria-invalid={state.invalid || props['aria-invalid'] || undefined} />
    <span {...slotProps.indicator} data-slot="indicator" aria-hidden="true" />
    {children != null && <span data-slot="label">{children}</span>}
  </label>;
}
