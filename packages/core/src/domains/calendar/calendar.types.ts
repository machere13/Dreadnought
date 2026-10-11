export type CalendarDate = string;

export interface CalendarDateParts {
  year: number;
  month: number;
  day: number;
}

export interface CalendarConstraints {
  minDate?: CalendarDate;
  maxDate?: CalendarDate;
  disabledDate?: (date: CalendarDate, context: { from?: CalendarDate }) => boolean;
}

export interface CalendarCell {
  date: CalendarDate | null;
  inMonth: boolean;
  weekday: number;
}

export interface CalendarRangeState {
  start: CalendarDate | null;
  end: CalendarDate | null;
}

export type CalendarNavigation =
  | 'previousDay'
  | 'nextDay'
  | 'previousWeek'
  | 'nextWeek'
  | 'weekStart'
  | 'weekEnd'
  | 'previousMonth'
  | 'nextMonth'
  | 'previousYear'
  | 'nextYear';
