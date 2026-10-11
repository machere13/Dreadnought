import type { CalendarCell, CalendarDate } from './calendar.types.ts';
import {
  assertCalendarDate,
  assertCalendarWeekStart,
  calendarTimestamp,
  calendarDayMilliseconds,
  formatCalendarTimestamp,
} from './calendarDate.ts';

export function getCalendarGrid(month: CalendarDate, weekStartsOn = 1): readonly CalendarCell[] {
  const parts = assertCalendarDate(month);
  assertCalendarWeekStart(weekStartsOn);
  const first = calendarTimestamp({ ...parts, day: 1 });
  const offset = (new Date(first).getUTCDay() - weekStartsOn + 7) % 7;
  return Array.from({ length: 42 }, (_, index) => {
    const date = formatCalendarTimestamp(first + (index - offset) * calendarDayMilliseconds);
    return {
      date,
      inMonth: date !== null && date.slice(0, 7) === month.slice(0, 7),
      weekday: (weekStartsOn + index) % 7,
    };
  });
}
