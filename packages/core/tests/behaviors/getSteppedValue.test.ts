import { expect, it } from 'vitest';
import { getSteppedValue } from '../../src/behaviors/getSteppedValue.ts';

it.each([
  [4, 1, 6, 2, 5],
  [3.9, 1, 6, 2, 3],
  [-10, 1, 6, 2, 1],
  [20, 1, 6, 2, 5],
  [6, 1, 6, 2, 5],
  [-2, -5, 5, 2, -1],
  [0.30000000000000004, 0, 0.3, 0.1, 0.3],
  [0.15, 0, 0.3, 0.1, 0.2],
  [0.07, 0.05, 0.34, 0.1, 0.05],
  [0.34, 0.05, 0.34, 0.1, 0.25],
  [2.6e-7, 1e-7, 6e-7, 2e-7, 3e-7],
  [0, 2, 3, 5, 2],
  [9, 2, 2, 1, 2],
  [Number.MAX_VALUE, -Number.MAX_VALUE, Number.MAX_VALUE, 1, Number.MAX_VALUE],
] as const)('snaps %s into [%s, %s] with step %s', (value, min, max, step, expected) => {
  expect(getSteppedValue(value, { min, max, step })).toBe(expected);
});

it('defaults to a unit step and does not mutate options', () => {
  const options = Object.freeze({ min: 0, max: 10 });
  expect(getSteppedValue(2.6, options)).toBe(3);
});

it.each([
  [NaN, { min: 0, max: 10 }],
  [Infinity, { min: 0, max: 10 }],
  [1, { min: NaN, max: 10 }],
  [1, { min: 0, max: Infinity }],
  [1, { min: 0, max: 10, step: NaN }],
  [1, { min: 0, max: 10, step: Infinity }],
] as const)('rejects non-finite input %s / %j', (value, options) => {
  expect(() => getSteppedValue(value, options)).toThrow(TypeError);
});

it.each([
  { min: 0, max: 10, step: 0 },
  { min: 0, max: 10, step: -1 },
  { min: 10, max: 0 },
])('rejects an invalid grid %j', (options) => {
  expect(() => getSteppedValue(1, options)).toThrow(RangeError);
});
