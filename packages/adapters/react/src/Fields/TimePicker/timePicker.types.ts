import type {
  ClockTime,
  TimeOption,
  TimeOptions,
  TimePart,
  TimeSelection,
  TooltipPlacement,
} from '@dreadnought/core';
import type { ComponentPropsWithRef, ComponentPropsWithoutRef, ReactNode, Ref } from 'react';

export interface UseTimePickerOptions extends TimeOptions {
  value?: ClockTime | null;
  defaultValue?: ClockTime | null;
  onChange?: (value: ClockTime | null) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  allowClear?: boolean;
}

export type TimePickerInputError = 'format' | 'disabled' | 'incomplete' | null;

export type TimePickerFieldProps = ComponentPropsWithRef<'input'>;
export type TimePickerActionProps = ComponentPropsWithoutRef<'button'> & {
  action: 'clock' | 'clear' | 'confirm' | 'option';
  'data-time-part'?: TimePart;
  'data-time-value'?: number;
};
export type TimePickerSlotClassNames = Partial<
  Record<
    'root' | 'field' | 'actions' | 'popup' | 'columns' | 'column' | 'option' | 'footer' | 'error',
    string
  >
>;
export type TimePickerAdapterProps = UseTimePickerOptions &
  Omit<
    ComponentPropsWithoutRef<'input'>,
    'value' | 'defaultValue' | 'onChange' | 'type' | 'size' | 'children' | 'prefix'
  > & {
    ref?: Ref<HTMLInputElement>;
    placement?: TooltipPlacement;
    slotClassNames?: TimePickerSlotClassNames;
    renderField?: (props: TimePickerFieldProps) => ReactNode;
    renderAction?: (props: TimePickerActionProps) => ReactNode;
  };

export interface UseTimePickerResult {
  value: ClockTime | null;
  draft: string;
  selection: TimeSelection;
  error: TimePickerInputError;
  open: boolean;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  showSeconds: boolean;
  columns: Record<TimePart, readonly TimeOption[]>;
  setOpen(open: boolean): void;
  setDraft(text: string): void;
  choose(part: TimePart, value: number): void;
  confirm(): void;
  clear(): void;
  cancel(): void;
  reset(): void;
}
