import { assertCalendarDate, getCalendarGrid, isCalendarDateAllowed } from '@dreadnought/core';
import type { CalendarDate, CalendarConstraints } from '@dreadnought/core';
import type { DatePickerValue, DatePickerInputError } from './datePicker.types.ts';

export function datePickerText(value: DatePickerValue): [string, string] {
  return value === null ? ['', ''] : typeof value === 'string' ? [value, ''] : [...value];
}

export function validateDatePickerValue(value: DatePickerValue, range: boolean): void {
  if (value === null) return;
  if (!range) {
    if (typeof value !== 'string') throw new TypeError('Single mode requires a calendar date');
    assertCalendarDate(value);
    return;
  }
  if (!Array.isArray(value) || value.length !== 2) {
    throw new TypeError('Range mode requires exactly two dates');
  }
  assertCalendarDate(value[0]);
  assertCalendarDate(value[1]);
  if (value[0] > value[1]) throw new RangeError('Range start must not exceed its end');
}

export function clampDatePickerMonth(
  date: CalendarDate,
  limits: CalendarConstraints,
): CalendarDate {
  assertCalendarDate(date);
  const lower = limits.minDate ?? '0001-01-01';
  const upper = limits.maxDate ?? '9999-12-31';
  const clamped = date < lower ? lower : date > upper ? upper : date;
  return `${clamped.slice(0, 7)}-01`;
}

export function localCalendarToday(): CalendarDate {
  const now = new Date();
  return `${now.getFullYear().toString().padStart(4, '0')}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
}

export function firstDatePickerDay(
  month: CalendarDate,
  preferred: CalendarDate,
  limits: CalendarConstraints,
  weekStartsOn: number,
  from?: CalendarDate,
): CalendarDate | null {
  if (
    preferred.slice(0, 7) === month.slice(0, 7) &&
    isCalendarDateAllowed(preferred, limits, from)
  ) {
    return preferred;
  }
  return (
    getCalendarGrid(month, weekStartsOn).find(
      (cell) =>
        cell.inMonth && cell.date !== null && isCalendarDateAllowed(cell.date, limits, from),
    )?.date ?? null
  );
}

export interface DatePickerModel {
  value: DatePickerValue;
  draft: [string, string];
  errors: [DatePickerInputError, DatePickerInputError];
  range: { start: CalendarDate | null; end: CalendarDate | null };
  month: CalendarDate;
  activeDate: CalendarDate | null;
  hoveredDate: CalendarDate | null;
  open: boolean;
}

export function datePickerModel(
  value: DatePickerValue,
  month: CalendarDate,
  open = false,
): DatePickerModel {
  return {
    value,
    draft: datePickerText(value),
    errors: [null, null],
    range: { start: null, end: null },
    month,
    open,
    activeDate: null,
    hoveredDate: null,
  };
}
