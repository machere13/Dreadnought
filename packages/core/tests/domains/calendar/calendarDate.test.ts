import { expect, it } from 'vitest';
import {
  parseCalendarDate,
  assertCalendarDate,
  addCalendarDays,
  addCalendarMonths,
  getCalendarGrid,
} from '../../../src/index.ts';

it.each([
  '2026-02-30',
  '1900-02-29',
  '0000-01-01',
  '10000-01-01',
  '2026-1-01',
  '2026-00-01',
  '2026-13-01',
  '2026-01-00',
  '2026-01-32',
  ' 2026-01-01',
  '2026-01-01T00:00:00Z',
  '',
])('rejects malformed or impossible date %s', (value) => {
  expect(parseCalendarDate(value)).toBeNull();
  expect(() => assertCalendarDate(value)).toThrow(TypeError);
});

it.each([
  ['0001-01-01', { year: 1, month: 1, day: 1 }],
  ['0099-12-31', { year: 99, month: 12, day: 31 }],
  ['2000-02-29', { year: 2000, month: 2, day: 29 }],
  ['2024-02-29', { year: 2024, month: 2, day: 29 }],
  ['9999-12-31', { year: 9999, month: 12, day: 31 }],
] as const)('parses calendar parts for %s', (value, parts) => {
  expect(parseCalendarDate(value)).toEqual(parts);
  expect(assertCalendarDate(value)).toEqual(parts);
});

it.each([
  ['0099-12-31', 1, '0100-01-01'],
  ['2026-12-31', 1, '2027-01-01'],
  ['2024-02-28', 1, '2024-02-29'],
  ['2024-03-01', -1, '2024-02-29'],
  ['2026-03-08', 1, '2026-03-09'],
  ['0001-01-01', -1, null],
  ['9999-12-31', 1, null],
  ['2026-10-12', 0, '2026-10-12'],
] as const)('shifts %s by %s days', (date, days, expected) => {
  expect(addCalendarDays(date, days)).toBe(expected);
});

it.each([
  ['2024-01-31', 1, '2024-02-29'],
  ['2026-01-31', 1, '2026-02-28'],
  ['2024-02-29', 12, '2025-02-28'],
  ['2026-01-31', -1, '2025-12-31'],
  ['0099-12-31', 1, '0100-01-31'],
  ['0001-01-01', -1, null],
  ['9999-12-31', 1, null],
] as const)('shifts %s by %s months without overflowing the day', (date, months, expected) => {
  expect(addCalendarMonths(date, months)).toBe(expected);
});

it.each([NaN, Infinity, 0.5, Number.MAX_SAFE_INTEGER + 1])(
  'rejects unsafe increment %s',
  (step) => {
    expect(() => addCalendarDays('2026-01-01', step)).toThrow(RangeError);
    expect(() => addCalendarMonths('2026-01-01', step)).toThrow(RangeError);
  },
);

it('builds six weeks from the configured weekday', () => {
  const monday = getCalendarGrid('2026-10-12');
  expect(monday).toHaveLength(42);
  expect(monday[0]).toEqual({ date: '2026-09-28', inMonth: false, weekday: 1 });
  expect(monday[3]).toEqual({ date: '2026-10-01', inMonth: true, weekday: 4 });
  expect(monday[41].date).toBe('2026-11-08');
  expect(getCalendarGrid('2026-10-01', 0)[0].date).toBe('2026-09-27');
  expect(getCalendarGrid('2024-02-01').filter((cell) => cell.inMonth)).toHaveLength(29);
  expect(getCalendarGrid('2026-02-01').filter((cell) => cell.inMonth)).toHaveLength(28);
});

it('uses empty cells instead of out-of-range years', () => {
  const first = getCalendarGrid('0001-01-01', 0);
  expect(first[0]).toEqual({ date: null, inMonth: false, weekday: 0 });
  expect(first[1].date).toBe('0001-01-01');
  const last = getCalendarGrid('9999-12-01');
  expect(last.filter((cell) => cell.date === null)).toHaveLength(9);
  expect(last[32].date).toBe('9999-12-31');
});

it.each([-1, 7, 1.5, NaN])('rejects invalid week start %s', (day) => {
  expect(() => getCalendarGrid('2026-10-01', day)).toThrow(RangeError);
});
