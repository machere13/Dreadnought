import { expect, it, vi } from 'vitest';
import {
  isCalendarDateAllowed,
  getNextCalendarDate,
  getCalendarRange,
} from '../../../src/index.ts';
import type { CalendarNavigation } from '../../../src/index.ts';

const limits = { minDate: '2026-10-01', maxDate: '2026-10-31' };

it('enforces inclusive bounds and predicate', () => {
  expect(isCalendarDateAllowed('2026-10-01', limits)).toBe(true);
  expect(isCalendarDateAllowed('2026-10-31', limits)).toBe(true);
  expect(isCalendarDateAllowed('2026-09-30', limits)).toBe(false);
  expect(isCalendarDateAllowed('2026-11-01', limits)).toBe(false);
  const disabledDate = vi.fn(() => true);
  expect(isCalendarDateAllowed('2026-10-12', { disabledDate }, '2026-10-10')).toBe(false);
  expect(disabledDate).toHaveBeenCalledWith('2026-10-12', { from: '2026-10-10' });
});

it('rejects impossible dates and contradictory bounds', () => {
  expect(() => isCalendarDateAllowed('2026-02-30')).toThrow(TypeError);
  expect(() =>
    isCalendarDateAllowed('2026-10-12', {
      minDate: '2026-11-01',
      maxDate: '2026-10-01',
    }),
  ).toThrow(RangeError);
  expect(() => isCalendarDateAllowed('2026-10-12', { minDate: 'x' })).toThrow(TypeError);
});

it.each([
  ['previousDay', '2026-10-11'],
  ['nextDay', '2026-10-13'],
  ['previousWeek', '2026-10-05'],
  ['nextWeek', '2026-10-19'],
  ['weekStart', '2026-10-12'],
  ['weekEnd', '2026-10-18'],
  ['previousMonth', '2026-09-12'],
  ['nextMonth', '2026-11-12'],
  ['previousYear', '2025-10-12'],
  ['nextYear', '2027-10-12'],
] as const)('moves focus using %s', (action, expected) => {
  expect(getNextCalendarDate('2026-10-12', action)).toBe(expected);
});

it('clamps a short month and respects week starts', () => {
  expect(getNextCalendarDate('2024-01-31', 'nextMonth')).toBe('2024-02-29');
  expect(getNextCalendarDate('2024-02-29', 'nextYear')).toBe('2025-02-28');
  expect(getNextCalendarDate('2026-10-12', 'weekStart', {}, 0)).toBe('2026-10-11');
});

it('skips disabled dates without wrapping at bounds', () => {
  expect(
    getNextCalendarDate('2026-10-12', 'nextDay', {
      ...limits,
      disabledDate: (date) => date === '2026-10-13',
    }),
  ).toBe('2026-10-14');
  expect(getNextCalendarDate('2026-10-31', 'nextDay', limits)).toBe('2026-10-31');
  expect(getNextCalendarDate('2026-10-01', 'previousDay', limits)).toBe('2026-10-01');
  expect(getNextCalendarDate('0001-01-01', 'previousDay')).toBe('0001-01-01');
  expect(getNextCalendarDate('9999-12-31', 'nextDay')).toBe('9999-12-31');
});

it('stops in a fully blocked month and keeps Home/End within the week', () => {
  expect(
    getNextCalendarDate('2026-10-12', 'nextDay', {
      ...limits,
      disabledDate: () => true,
    }),
  ).toBe('2026-10-12');
  expect(
    getNextCalendarDate('2026-10-14', 'weekStart', {
      ...limits,
      disabledDate: (date) => date >= '2026-10-12' && date <= '2026-10-18',
    }),
  ).toBe('2026-10-14');
});

it('rejects an unknown runtime navigation action', () => {
  expect(() => getNextCalendarDate('2026-10-12', 'unknown' as CalendarNavigation)).toThrow(
    TypeError,
  );
});

it('starts, sorts and restarts an immutable range', () => {
  const empty = Object.freeze({ start: null, end: null });
  const start = getCalendarRange(empty, '2026-10-20', limits);
  expect(start).toEqual({ start: '2026-10-20', end: null });
  const complete = getCalendarRange(Object.freeze(start), '2026-10-10', limits);
  expect(complete).toEqual({ start: '2026-10-10', end: '2026-10-20' });
  expect(getCalendarRange(complete, '2026-10-25', limits)).toEqual({
    start: '2026-10-25',
    end: null,
  });
  expect(empty).toEqual({ start: null, end: null });
});

it('permits an identical endpoint and disabled interior dates', () => {
  expect(getCalendarRange({ start: '2026-10-10', end: null }, '2026-10-10')).toEqual({
    start: '2026-10-10',
    end: '2026-10-10',
  });
  expect(
    getCalendarRange({ start: '2026-10-10', end: null }, '2026-10-20', {
      disabledDate: (date) => date === '2026-10-15',
    }),
  ).toEqual({ start: '2026-10-10', end: '2026-10-20' });
});

it('cannot evade endpoint or contextual restrictions by sorting', () => {
  const state = Object.freeze({ start: '2026-10-20', end: null });
  expect(
    getCalendarRange(state, '2026-10-10', {
      disabledDate: (date, { from }) => from !== undefined && date < from,
    }),
  ).toBe(state);
  expect(
    getCalendarRange(state, '2026-10-10', {
      disabledDate: (date) => date === '2026-10-20',
    }),
  ).toBe(state);
  expect(getCalendarRange(state, '2026-11-10', limits)).toBe(state);
});

it('rejects malformed or backwards programmatic ranges', () => {
  expect(() => getCalendarRange({ start: null, end: '2026-10-10' }, '2026-10-12')).toThrow(
    TypeError,
  );
  expect(() => getCalendarRange({ start: 'x', end: null }, '2026-10-12')).toThrow(TypeError);
  expect(() => getCalendarRange({ start: '2026-10-20', end: '2026-10-10' }, '2026-10-12')).toThrow(
    RangeError,
  );
});
