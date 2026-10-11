import { useLayoutEffect, useState } from 'react';
import type { InputHTMLAttributes, RefObject } from 'react';

export interface FieldExtrasOptions {
  allowClear?: boolean;
  clearLabel?: string;
  showCount?: boolean;
}

type FieldValueOptions = FieldExtrasOptions &
  Pick<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'disabled' | 'readOnly'>;

export function useTextFieldExtras(
  control: RefObject<HTMLInputElement | HTMLTextAreaElement | null>,
  {
    value,
    defaultValue,
    disabled,
    readOnly,
    allowClear = false,
    showCount = false,
    clearLabel = 'Clear input',
  }: FieldValueOptions,
) {
  const [uncontrolledValue, setUncontrolledValue] = useState(String(defaultValue ?? ''));
  const currentValue = value === undefined ? uncontrolledValue : String(value);
  useLayoutEffect(() => {
    const node = control.current;
    if (!node || (!allowClear && !showCount)) return;
    const form = node.form;
    let active = true;
    const update = () => setUncontrolledValue(node.value);
    const reset = (event: Event) => {
      queueMicrotask(() => {
        if (active && !event.defaultPrevented && node.form === form) update();
      });
    };
    update();
    node.addEventListener('input', update);
    form?.addEventListener('reset', reset);
    return () => {
      active = false;
      node.removeEventListener('input', update);
      form?.removeEventListener('reset', reset);
    };
  });
  const clearButtonProps =
    allowClear && currentValue && !disabled && !readOnly
      ? {
          type: 'button' as const,
          'aria-label': clearLabel,
          onClick: () => {
            const node = control.current;
            if (!node || node.matches(':disabled') || node.readOnly || !node.value) return;
            Object.getOwnPropertyDescriptor(Object.getPrototypeOf(node), 'value')!.set!.call(
              node,
              '',
            );
            node.dispatchEvent(
              new node.ownerDocument.defaultView!.Event('input', { bubbles: true }),
            );
            node.focus({ preventScroll: true });
          },
        }
      : undefined;
  return { clearButtonProps, count: currentValue.length };
}
