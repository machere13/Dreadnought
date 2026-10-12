import type { ClockTime, ClockTimeParts } from './time.types.ts';

export function parseClockTime(text: unknown): ClockTimeParts | null {
  if (typeof text !== 'string' || text.length !== 8) return null;
  const match = /^(\d{2}):(\d{2}):(\d{2})$/.exec(text);
  if (!match) return null;
  const [hour, minute, second] = match.slice(1).map(Number);
  return hour < 24 && minute < 60 && second < 60 ? { hour, minute, second } : null;
}

export function assertClockTime(value: unknown): ClockTimeParts {
  const parts = parseClockTime(value);
  if (!parts) throw new TypeError('Time requires HH:mm:ss within a day');
  return parts;
}

export function formatClockTime(parts: ClockTimeParts): ClockTime {
  if (!parts || typeof parts !== 'object' || Array.isArray(parts)) {
    throw new TypeError('Time requires hour, minute and second');
  }
  const values = [parts.hour, parts.minute, parts.second];
  for (const [index, value] of values.entries()) {
    if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
      throw new TypeError('Time parts must be integers');
    }
    if (value < 0 || value >= (index === 0 ? 24 : 60)) {
      throw new RangeError('Time parts must be within a day');
    }
  }
  return values.map((value) => String(value).padStart(2, '0')).join(':');
}
