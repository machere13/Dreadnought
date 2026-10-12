import { assertClockTime, formatClockTime } from './clockTime.ts';
import type {
  ClockTime,
  ClockTimeParts,
  TimeConstraints,
  TimeOption,
  TimeOptions,
  TimePart,
  TimeSelection,
} from './time.types.ts';

const units = ['hour', 'minute', 'second'] as const;

function integer(value: number): void {
  if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
    throw new TypeError('Time unit values and steps must be integers');
  }
}

function forbidden(values: readonly number[], maximum: number): Set<number> {
  if (!Array.isArray(values)) throw new TypeError('Disabled time units require an array');
  for (const value of values) {
    integer(value);
    if (value < 0 || value >= maximum) throw new RangeError('Disabled time unit out of range');
  }
  return new Set(values);
}

function timeContext(options: TimeOptions) {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('Time options require an object');
  }
  if (options.showSeconds !== undefined && typeof options.showSeconds !== 'boolean') {
    throw new TypeError('showSeconds must be boolean');
  }
  const lower = options.minTime === undefined ? '00:00:00' : options.minTime;
  const upper = options.maxTime === undefined ? '23:59:59' : options.maxTime;
  assertClockTime(lower);
  assertClockTime(upper);
  if (lower > upper) throw new RangeError('Time requires minTime <= maxTime');
  const grids = units.map((part, index) => {
    const maximum = index === 0 ? 24 : 60;
    const configured = options[`${part}Step`];
    const step = configured === undefined ? 1 : configured;
    integer(step);
    if (step < 1 || step > maximum) throw new RangeError('Time step out of range');
    return Array.from({ length: Math.ceil(maximum / step) }, (_, value) => value * step);
  });
  if (!options.showSeconds) grids[2] = [0];
  const disabled = options.disabledTime;
  if (
    disabled !== undefined &&
    (!disabled || typeof disabled !== 'object' || Array.isArray(disabled))
  ) {
    throw new TypeError('disabledTime requires an object');
  }
  for (const callback of [disabled?.minutes, disabled?.seconds]) {
    if (callback !== undefined && typeof callback !== 'function') {
      throw new TypeError('Disabled time dependencies require functions');
    }
  }
  const hours = forbidden(disabled?.hours === undefined ? [] : disabled.hours, 24);
  const minutes = new Map<number, Set<number>>();
  const seconds = new Map<number, Set<number>>();
  function allowed(parts: ClockTimeParts): boolean {
    const { hour, minute, second } = parts;
    const time = formatClockTime(parts);
    if (time < lower || time > upper || hours.has(hour)) return false;
    if (!minutes.has(hour))
      minutes.set(hour, forbidden(disabled?.minutes ? disabled.minutes(hour) : [], 60));
    if (minutes.get(hour)!.has(minute)) return false;
    const key = hour * 60 + minute;
    if (!seconds.has(key))
      seconds.set(key, forbidden(disabled?.seconds ? disabled.seconds(hour, minute) : [], 60));
    return !seconds.get(key)!.has(second);
  }
  function complete(prefix: Partial<ClockTimeParts>): ClockTimeParts | null {
    const hourValues = prefix.hour === undefined ? grids[0] : [prefix.hour];
    for (const hour of hourValues) {
      if (hours.has(hour)) continue;
      const minuteValues = prefix.minute === undefined ? grids[1] : [prefix.minute];
      for (const minute of minuteValues) {
        const secondValues = prefix.second === undefined ? grids[2] : [prefix.second];
        for (const second of secondValues) {
          const parts = { hour, minute, second };
          if (allowed(parts)) return parts;
        }
      }
    }
    return null;
  }
  return { grids, allowed, complete };
}

function selectionPrefix(part: TimePart, selection: TimeSelection, value: number) {
  if (!selection || typeof selection !== 'object' || Array.isArray(selection)) {
    throw new TypeError('Time selection requires nullable units');
  }
  for (const [index, unit] of units.entries()) {
    const current = selection[unit];
    if (current === null) continue;
    integer(current);
    if (current < 0 || current >= (index === 0 ? 24 : 60)) {
      throw new RangeError('Time selection unit out of range');
    }
  }
  if (!units.includes(part)) throw new TypeError('Unknown time unit');
  if (part === 'hour') return { hour: value };
  if (selection.hour === null) return null;
  if (part === 'minute') return { hour: selection.hour, minute: value };
  if (selection.minute === null) return null;
  return { hour: selection.hour, minute: selection.minute, second: value };
}

function validateSeconds(selection: TimeSelection, options: TimeOptions) {
  if (!options.showSeconds && selection.second !== null && selection.second !== 0) {
    throw new RangeError('Hidden seconds must be zero');
  }
}

export function isClockTimeAllowed(time: ClockTime, constraints: TimeConstraints = {}): boolean {
  return timeContext(constraints).allowed(assertClockTime(time));
}

export function getTimeOptions(
  part: TimePart,
  selection: TimeSelection,
  options: TimeOptions = {},
): readonly TimeOption[] {
  selectionPrefix(part, selection, 0);
  validateSeconds(selection, options);
  const context = timeContext(options);
  return context.grids[units.indexOf(part)].map((value) => {
    const prefix = selectionPrefix(part, selection, value);
    return {
      value,
      label: String(value).padStart(2, '0'),
      disabled: !prefix || !context.complete(prefix),
    };
  });
}

export function getTimeSelection(
  selection: TimeSelection,
  part: TimePart,
  value: number,
  options: TimeOptions = {},
): TimeSelection {
  integer(value);
  const prefix = selectionPrefix(part, selection, value);
  validateSeconds(selection, options);
  const context = timeContext(options);
  if (!prefix || !context.grids[units.indexOf(part)].includes(value)) return { ...selection };
  const candidate = { ...selection, ...prefix };
  const index = units.indexOf(part);
  const compatible = units.every(
    (unit, position) =>
      candidate[unit] !== null &&
      (position <= index || context.grids[position].includes(candidate[unit])),
  );
  if (compatible && context.allowed(candidate as ClockTimeParts)) return candidate;
  return context.complete(prefix) ?? { ...selection };
}
