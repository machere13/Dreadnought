import { assertClockTime, isClockTimeAllowed, parseClockTime } from '@dreadnought/core';
import type { ClockTime, TimeConstraints, TimeSelection } from '@dreadnought/core';
import type { TimePickerInputError } from './timePicker.types.ts';

export function timePickerText(value: ClockTime | null, showSeconds: boolean): string {
  if (value === null) return '';
  const parts = assertClockTime(value);
  if (!showSeconds && parts.second !== 0) throw new RangeError('Hidden seconds must be zero');
  return showSeconds ? value : value.slice(0, 5);
}

export function parseTimePickerDraft(text: string, showSeconds: boolean): ClockTime | null {
  const value = showSeconds ? text : `${text}:00`;
  return parseClockTime(value) ? value : null;
}

export function timePickerDraftError(
  text: string,
  showSeconds: boolean,
  constraints: TimeConstraints,
): TimePickerInputError {
  if (!text) return null;
  const value = parseTimePickerDraft(text, showSeconds);
  if (value) return isClockTimeAllowed(value, constraints) ? null : 'disabled';
  const incomplete = text.length < (showSeconds ? 8 : 5) && /^\d{0,2}(?::\d{0,2}){0,2}$/.test(text);
  return incomplete ? 'incomplete' : 'format';
}

export function timePickerSelection(value: ClockTime | null): TimeSelection {
  return value === null ? { hour: null, minute: null, second: null } : assertClockTime(value);
}
