import type {
  ClockTime,
  TimeOption,
  TimeOptions,
  TimePart,
  TimeSelection,
} from '@dreadnought/core';

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
