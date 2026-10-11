import type {
  CalendarConstraints,
  CalendarDate,
  CalendarNavigation,
  CalendarRangeState,
} from '@dreadnought/core';

import type { ComponentPropsWithRef, ComponentPropsWithoutRef, ReactNode, Ref } from 'react';
import type { TooltipPlacement } from '@dreadnought/core';

export type DatePickerRange = readonly [CalendarDate, CalendarDate];
export type DatePickerValue = CalendarDate | DatePickerRange | null;
export type DatePickerEndpoint = 0 | 1;
export type DatePickerInputError = 'format' | 'disabled' | 'incomplete' | null;

export interface DatePickerOptions extends CalendarConstraints {
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  allowClear?: boolean;
  locale?: string;
  weekStartsOn?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export type DatePickerSelection =
  | {
      mode?: 'single';
      value?: CalendarDate | null;
      defaultValue?: CalendarDate | null;
      onChange?: (value: CalendarDate | null) => void;
      placeholder?: string;
    }
  | {
      mode: 'range';
      value?: DatePickerRange | null;
      defaultValue?: DatePickerRange | null;
      onChange?: (value: DatePickerRange | null) => void;
      placeholder?: readonly [string, string];
    };

export type UseDatePickerOptions = DatePickerOptions & DatePickerSelection;

export interface DatePickerControls {
  open: boolean;
  month: CalendarDate;
  draft: readonly [string, string];
  errors: readonly [DatePickerInputError, DatePickerInputError];
  range: CalendarRangeState;
  activeDate: CalendarDate | null;
  hoveredDate: CalendarDate | null;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  locale: string;
  weekStartsOn: number;
  constraints: CalendarConstraints;
  setOpen(open: boolean): void;
  setDraft(index: DatePickerEndpoint, text: string): void;
  confirm(): void;
  choose(date: CalendarDate): void;
  clear(): void;
  cancel(): void;
  reset(): void;
  setMonth(date: CalendarDate): void;
  move(action: CalendarNavigation): void;
  hover(date: CalendarDate | null): void;
}

export type UseDatePickerResult = DatePickerControls &
  (
    | { mode: 'single'; value: CalendarDate | null }
    | { mode: 'range'; value: DatePickerRange | null }
  );

export type DatePickerFieldProps = Omit<ComponentPropsWithRef<'input'>, 'type'> & {
  type?: 'text' | 'number';
};
export type DatePickerActionProps = ComponentPropsWithoutRef<'button'> & {
  action: 'calendar' | 'clear' | 'previous' | 'next' | 'day';
  'data-date'?: string;
};
export interface DatePickerMonthSelectProps {
  value: string;
  options: readonly { value: string; label: string; disabled: boolean }[];
  disabled: boolean;
  'aria-label': string;
  onChange(value: string): void;
}
export interface DatePickerRenderers {
  renderField?: (props: DatePickerFieldProps) => ReactNode;
  renderAction?: (props: DatePickerActionProps) => ReactNode;
  renderMonthSelect?: (props: DatePickerMonthSelectProps) => ReactNode;
}
export type DatePickerSlotClassNames = Partial<
  Record<
    'root' | 'fields' | 'field' | 'actions' | 'popup' | 'header' | 'grid' | 'day' | 'error',
    string
  >
>;
export type DatePickerAdapterProps = UseDatePickerOptions &
  DatePickerRenderers &
  Omit<
    ComponentPropsWithoutRef<'input'>,
    'value' | 'defaultValue' | 'onChange' | 'placeholder' | 'type' | 'size' | 'children' | 'prefix'
  > & {
    ref?: Ref<HTMLInputElement>;
    placement?: TooltipPlacement;
    slotClassNames?: DatePickerSlotClassNames;
  };
