import type {
  CalendarConstraints,
  CalendarDate,
  CalendarNavigation,
  CalendarRangeState,
} from './calendar.types.ts';
import {
  addCalendarMonths,
  assertCalendarDate,
  assertCalendarWeekStart,
  calendarTimestamp,
  calendarDayMilliseconds,
  formatCalendarTimestamp,
} from './calendarDate.ts';

function bounds(limits: CalendarConstraints) {
  const min = limits.minDate ?? '0001-01-01';
  const max = limits.maxDate ?? '9999-12-31';
  assertCalendarDate(min);
  assertCalendarDate(max);
  if (min > max) throw new RangeError('Minimum date must not exceed maximum date');
  if (limits.disabledDate !== undefined && typeof limits.disabledDate !== 'function') {
    throw new TypeError('disabledDate must be a function');
  }
  return { min, max };
}

export function isCalendarDateAllowed(
  date: CalendarDate,
  limits: CalendarConstraints = {},
  from?: CalendarDate,
): boolean {
  assertCalendarDate(date);
  if (from !== undefined) assertCalendarDate(from);
  const { min, max } = bounds(limits);
  return date >= min && date <= max && !limits.disabledDate?.(date, { from });
}

export function getNextCalendarDate(
  date: CalendarDate,
  action: CalendarNavigation,
  limits: CalendarConstraints = {},
  weekStartsOn = 1,
  from?: CalendarDate,
): CalendarDate {
  const parts = assertCalendarDate(date);
  assertCalendarWeekStart(weekStartsOn);
  if (from !== undefined) assertCalendarDate(from);
  const { min, max } = bounds(limits);
  const timestamp = calendarTimestamp(parts);
  const weekOffset = (new Date(timestamp).getUTCDay() - weekStartsOn + 7) % 7;
  const daySteps = {
    previousDay: -1,
    nextDay: 1,
    previousWeek: -7,
    nextWeek: 7,
    weekStart: -weekOffset,
    weekEnd: 6 - weekOffset,
  };
  const monthSteps = { previousMonth: -1, nextMonth: 1, previousYear: -12, nextYear: 12 };
  let target: CalendarDate | null;
  let direction: number;
  if (Object.hasOwn(daySteps, action)) {
    const step = daySteps[action as keyof typeof daySteps];
    target = formatCalendarTimestamp(timestamp + step * calendarDayMilliseconds);
    direction = action === 'weekStart' ? 1 : action === 'weekEnd' ? -1 : Math.sign(step);
  } else if (Object.hasOwn(monthSteps, action)) {
    const step = monthSteps[action as keyof typeof monthSteps];
    target = addCalendarMonths(date, step);
    direction = Math.sign(step);
  } else {
    throw new TypeError('Unknown calendar navigation action');
  }
  if (target === null || target < min || target > max) return date;
  let lower = calendarTimestamp(assertCalendarDate(min));
  let upper = calendarTimestamp(assertCalendarDate(max));
  if (action === 'weekStart' || action === 'weekEnd') {
    lower = Math.max(lower, timestamp - weekOffset * calendarDayMilliseconds);
    upper = Math.min(upper, timestamp + (6 - weekOffset) * calendarDayMilliseconds);
  }
  const first = calendarTimestamp(assertCalendarDate(target));
  const steps = Math.min(366, Math.floor((upper - lower) / calendarDayMilliseconds) + 1);
  for (let index = 0; index < steps; index++) {
    const candidateTime = first + index * direction * calendarDayMilliseconds;
    if (candidateTime < lower || candidateTime > upper) break;
    const candidate = formatCalendarTimestamp(candidateTime)!;
    if (!limits.disabledDate?.(candidate, { from })) return candidate;
  }
  return date;
}

export function getCalendarRange(
  state: CalendarRangeState,
  date: CalendarDate,
  limits: CalendarConstraints = {},
): CalendarRangeState {
  if (state.start !== null) assertCalendarDate(state.start);
  if (state.end !== null) {
    assertCalendarDate(state.end);
    if (state.start === null) throw new TypeError('Range end requires a start');
    if (state.start > state.end) throw new RangeError('Range start must not exceed its end');
  }
  const from = state.start !== null && state.end === null ? state.start : undefined;
  if (!isCalendarDateAllowed(date, limits, from)) return state;
  if (from === undefined) return { start: date, end: null };
  if (!isCalendarDateAllowed(from, limits) || !isCalendarDateAllowed(date, limits)) return state;
  return from <= date ? { start: from, end: date } : { start: date, end: from };
}
