export type ClockTime = string;
export type TimePart = 'hour' | 'minute' | 'second';

export interface ClockTimeParts {
  hour: number;
  minute: number;
  second: number;
}

export interface TimeSelection {
  hour: number | null;
  minute: number | null;
  second: number | null;
}

export interface DisabledTime {
  hours?: readonly number[];
  minutes?: (hour: number) => readonly number[];
  seconds?: (hour: number, minute: number) => readonly number[];
}

export interface TimeConstraints {
  minTime?: ClockTime;
  maxTime?: ClockTime;
  disabledTime?: DisabledTime;
}

export interface TimeOptions extends TimeConstraints {
  showSeconds?: boolean;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
}

export interface TimeOption {
  value: number;
  label: string;
  disabled: boolean;
}
