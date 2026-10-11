import type { CalendarDate, CalendarDateParts } from './calendar.types.ts';

export const calendarDayMilliseconds = 86_400_000;

export function calendarTimestamp(parts: CalendarDateParts): number {
  const date = new Date(0);
  date.setUTCFullYear(parts.year, parts.month - 1, parts.day);
  return date.getTime();
}

export function formatCalendarTimestamp(timestamp: number): CalendarDate | null {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  if (!Number.isInteger(year) || year < 1 || year > 9999) return null;
  return [
    year.toString().padStart(4, '0'),
    (date.getUTCMonth() + 1).toString().padStart(2, '0'),
    date.getUTCDate().toString().padStart(2, '0'),
  ].join('-');
}

export function parseCalendarDate(value: string): CalendarDateParts | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const parts = { year, month, day };
  return formatCalendarTimestamp(calendarTimestamp(parts)) === value ? parts : null;
}

export function assertCalendarDate(value: CalendarDate): CalendarDateParts {
  const parts = parseCalendarDate(value);
  if (!parts) throw new TypeError('Expected a valid calendar date in YYYY-MM-DD format');
  return parts;
}

export function assertCalendarWeekStart(day: number): void {
  if (!Number.isInteger(day) || day < 0 || day > 6) {
    throw new RangeError('Week start must be an integer between 0 and 6');
  }
}

export function addCalendarDays(value: CalendarDate, days: number): CalendarDate | null {
  const parts = assertCalendarDate(value);
  if (!Number.isSafeInteger(days)) throw new RangeError('Day increment must be a safe integer');
  return formatCalendarTimestamp(calendarTimestamp(parts) + days * calendarDayMilliseconds);
}

export function addCalendarMonths(value: CalendarDate, months: number): CalendarDate | null {
  const parts = assertCalendarDate(value);
  if (!Number.isSafeInteger(months)) throw new RangeError('Month increment must be a safe integer');
  const monthIndex = (parts.year - 1) * 12 + parts.month - 1 + months;
  if (monthIndex < 0 || monthIndex >= 9999 * 12) return null;
  const year = Math.floor(monthIndex / 12) + 1;
  const month = (monthIndex % 12) + 1;
  const lastDay = new Date(calendarTimestamp({ year, month: month + 1, day: 0 })).getUTCDate();
  return formatCalendarTimestamp(
    calendarTimestamp({ year, month, day: Math.min(parts.day, lastDay) }),
  );
}
