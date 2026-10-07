import { expect, it } from 'vitest';
import { getSteppedRange, getSteppedValue } from '../../src/index.ts';

it('selects the nearest explicit point, preferring the larger on ties', () => {
  const grid = { min: 0, max: 100, step: null, points: Object.freeze([100, 30, 0, 30]) };
  expect(getSteppedValue(65, grid)).toBe(100);
  expect(getSteppedValue(42, grid)).toBe(30);
  expect(getSteppedValue(-10, grid)).toBe(0);
  expect(getSteppedValue(150, grid)).toBe(100);
});

it('allows off-grid marks alongside numeric steps', () => {
  const grid = { min: 0, max: 100, step: 20, points: [33, 95, 100] };
  expect(getSteppedValue(33, grid)).toBe(33);
  expect(getSteppedValue(41, grid)).toBe(40);
  expect(getSteppedValue(94, grid)).toBe(95);
});

it('preserves decimal midpoint rounding with explicit and redundant points', () => {
  expect(getSteppedValue(0.3, { min: 0, max: 1, step: 0.2, points: [0.2, 0.4] })).toBe(0.4);
  expect(getSteppedValue(0.3, { min: 0, max: 1, step: null, points: [0.2, 0.4] })).toBe(0.4);
});

it('ignores outside points and rejects an empty discrete domain or non-finite points', () => {
  expect(getSteppedValue(50, { min: 0, max: 100, step: null, points: [-1, 30, 101] })).toBe(30);
  expect(() => getSteppedValue(0, { min: 0, max: 100, step: null })).toThrow(RangeError);
  expect(() => getSteppedValue(0, { min: 0, max: 100, points: [NaN] })).toThrow(TypeError);
});

it('normalizes a discrete range without crossing its neighbor', () => {
  const grid = { min: 0, max: 100, step: null, points: [10, 30, 80] };
  expect(getSteppedRange([100, 0], grid)).toEqual([10, 80]);
  expect(getSteppedRange([10, 30], grid, { index: 0, value: 100 })).toEqual([30, 30]);
});
