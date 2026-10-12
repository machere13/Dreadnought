import { describe, expect, it } from 'vitest';
import { getTimeOptions, getTimeSelection } from '../../../src/index.ts';

const empty = Object.freeze({ hour: null, minute: null, second: null });
describe('time selection', () => {
  it('does not invent a published value for empty lower columns', () => {
    expect(getTimeOptions('hour', empty)).toHaveLength(24);
    expect(getTimeOptions('minute', empty).every((option) => option.disabled)).toBe(true);
    expect(getTimeSelection(empty, 'minute', 15)).toEqual(empty);
  });
  it('selects the first allowed completion of an hour', () => {
    const limits = { minTime: '09:30:00', maxTime: '10:00:00', minuteStep: 15 };
    expect(getTimeSelection(empty, 'hour', 9, limits)).toEqual({ hour: 9, minute: 30, second: 0 });
    expect(
      getTimeOptions('hour', empty, limits)
        .filter((option) => !option.disabled)
        .map((option) => option.value),
    ).toEqual([9, 10]);
  });
  it('preserves compatible lower units and repairs incompatible units', () => {
    const selection = Object.freeze({ hour: 9, minute: 30, second: 15 });
    expect(getTimeSelection(selection, 'hour', 10, { showSeconds: true })).toEqual({
      hour: 10,
      minute: 30,
      second: 15,
    });
    expect(
      getTimeSelection(selection, 'hour', 10, {
        showSeconds: true,
        disabledTime: { minutes: (hour) => (hour === 10 ? [30] : []) },
      }),
    ).toEqual({ hour: 10, minute: 0, second: 0 });
    expect(getTimeSelection(selection, 'minute', 45, { showSeconds: true })).toEqual({
      hour: 9,
      minute: 45,
      second: 15,
    });
    expect(getTimeSelection(selection, 'second', 20, { showSeconds: true })).toEqual({
      hour: 9,
      minute: 30,
      second: 20,
    });
    expect(selection).toEqual({ hour: 9, minute: 30, second: 15 });
  });
  it('does not round manual values until a new panel option is selected', () => {
    const selection = { hour: 9, minute: 7, second: 0 };
    expect(
      getTimeOptions('minute', selection, { minuteStep: 15 }).map((option) => option.value),
    ).toEqual([0, 15, 30, 45]);
    expect(getTimeSelection(selection, 'hour', 10, { minuteStep: 15 })).toEqual({
      hour: 10,
      minute: 0,
      second: 0,
    });
    expect(getTimeSelection(selection, 'minute', 7, { minuteStep: 15 })).toEqual(selection);
    expect(getTimeSelection(selection, 'hour', 99)).toEqual(selection);
  });
  it('disables a prefix with no legal completion and terminates all-disabled input', () => {
    const seconds = Object.freeze(Array.from({ length: 60 }, (_, value) => value));
    const limits = {
      showSeconds: true,
      disabledTime: { seconds: (hour: number) => (hour === 9 ? seconds : []) },
    };
    expect(getTimeOptions('hour', empty, limits)[9].disabled).toBe(true);
    expect(getTimeSelection(empty, 'hour', 9, limits)).toEqual(empty);
    const blocked = {
      disabledTime: { hours: Object.freeze(Array.from({ length: 24 }, (_, value) => value)) },
    };
    expect(getTimeOptions('hour', empty, blocked).every((option) => option.disabled)).toBe(true);
    expect(getTimeSelection(empty, 'hour', 0, blocked)).toEqual(empty);
  });
  it('uses only zero for hidden seconds and respects exact bounds', () => {
    expect(
      getTimeSelection(empty, 'hour', 9, { minTime: '09:30:01', maxTime: '09:31:00' }),
    ).toEqual({ hour: 9, minute: 31, second: 0 });
    expect(
      getTimeSelection(empty, 'hour', 23, {
        showSeconds: true,
        minTime: '23:59:59',
        maxTime: '23:59:59',
      }),
    ).toEqual({ hour: 23, minute: 59, second: 59 });
    expect(() => getTimeOptions('hour', { hour: 9, minute: 0, second: 1 })).toThrow(RangeError);
  });
  it('validates steps and keeps extreme steps bounded', () => {
    expect(getTimeOptions('hour', empty, { hourStep: 24 }).map((option) => option.value)).toEqual([
      0,
    ]);
    expect(
      getTimeOptions('minute', { hour: 0, minute: null, second: null }, { minuteStep: 60 }),
    ).toHaveLength(1);
    expect(() => getTimeOptions('hour', empty, { hourStep: 0 })).toThrow(RangeError);
    expect(() => getTimeOptions('hour', empty, { minuteStep: 61 })).toThrow(RangeError);
    expect(() => getTimeOptions('hour', empty, { secondStep: 1.5 })).toThrow(TypeError);
    expect(() => getTimeSelection(empty, 'hour', NaN)).toThrow(TypeError);
  });
  it('rejects explicit null steps rather than silently using a default', () => {
    expect(() => getTimeOptions('hour', empty, { hourStep: null as never })).toThrow(TypeError);
  });
});
