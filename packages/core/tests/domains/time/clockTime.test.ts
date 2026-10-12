import { describe, expect, it } from 'vitest';
import {
  parseClockTime,
  assertClockTime,
  formatClockTime,
  isClockTimeAllowed,
} from '../../../src/index.ts';

describe('clock time', () => {
  it.each([
    ['00:00:00', { hour: 0, minute: 0, second: 0 }],
    ['09:07:03', { hour: 9, minute: 7, second: 3 }],
    ['23:59:59', { hour: 23, minute: 59, second: 59 }],
  ])('parses %s without a date or zone', (text, parts) => {
    expect(parseClockTime(text)).toEqual(parts);
    expect(assertClockTime(text)).toEqual(parts);
    expect(formatClockTime(parts)).toBe(text);
  });
  it.each([
    '24:00:00',
    '09:60:00',
    '09:00:60',
    '9:07:03',
    '09:07',
    '09:',
    '',
    ' 09:00:00',
    '09:00:00\n',
    null,
    90000,
  ])('rejects noncanonical %s', (text) => {
    expect(parseClockTime(text)).toBeNull();
    expect(() => assertClockTime(text)).toThrow(TypeError);
  });
  it('rejects invalid numeric parts without mutating them', () => {
    const parts = Object.freeze({ hour: 10, minute: 7, second: 0 });
    expect(formatClockTime(parts)).toBe('10:07:00');
    expect(() => formatClockTime({ ...parts, hour: 24 })).toThrow(RangeError);
    expect(() => formatClockTime({ ...parts, second: -1 })).toThrow(RangeError);
    expect(() => formatClockTime({ ...parts, minute: 1.5 })).toThrow(TypeError);
    expect(() => formatClockTime({ ...parts, second: Infinity })).toThrow(TypeError);
  });
  it('applies inclusive bounds and dependent forbidden units', () => {
    const limits = {
      minTime: '09:30:00',
      maxTime: '10:00:00',
      disabledTime: {
        hours: Object.freeze([8, 8]),
        minutes: (hour: number) => (hour === 9 ? [31] : []),
        seconds: (hour: number, minute: number) => (hour === 9 && minute === 30 ? [1] : []),
      },
    };
    expect(isClockTimeAllowed('09:30:00', limits)).toBe(true);
    expect(isClockTimeAllowed('10:00:00', limits)).toBe(true);
    expect(isClockTimeAllowed('09:29:59', limits)).toBe(false);
    expect(isClockTimeAllowed('10:00:01', limits)).toBe(false);
    expect(isClockTimeAllowed('09:31:00', limits)).toBe(false);
    expect(isClockTimeAllowed('09:30:01', limits)).toBe(false);
    expect(isClockTimeAllowed('09:37:00', limits)).toBe(true);
  });
  it('rejects broken constraints and callback results', () => {
    expect(() =>
      isClockTimeAllowed('09:00:00', { minTime: '10:00:00', maxTime: '09:00:00' }),
    ).toThrow(RangeError);
    expect(() => isClockTimeAllowed('09:00:00', { maxTime: '24:00:00' })).toThrow(TypeError);
    expect(() => isClockTimeAllowed('09:00:00', { disabledTime: { hours: [24] } })).toThrow(
      RangeError,
    );
    expect(() =>
      isClockTimeAllowed('09:00:00', { disabledTime: { minutes: () => [1.5] } }),
    ).toThrow(TypeError);
    expect(() =>
      isClockTimeAllowed('09:00:00', { disabledTime: { seconds: () => null as never } }),
    ).toThrow(TypeError);
  });
  it('does not turn explicit malformed null constraints into defaults', () => {
    expect(() => isClockTimeAllowed('09:00:00', { minTime: null as never })).toThrow(TypeError);
    expect(() =>
      isClockTimeAllowed('09:00:00', { disabledTime: { hours: null as never } }),
    ).toThrow(TypeError);
  });
});
