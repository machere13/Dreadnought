import { expect, it } from 'vitest';
import * as core from '../../src/index.ts';

it('exposes range normalization as a framework-independent behavior', () => {
  expect(core).toHaveProperty('getSteppedRange', expect.any(Function));
});

it.each([
  [[8, 2], { min: 0, max: 10 }, [2, 8]],
  [[-9, 9], { min: -2, max: 3, step: 2 }, [-2, 2]],
  [[0.30000000000000004, 0.15], { min: 0, max: 0.4, step: 0.1 }, [0.2, 0.3]],
  [[4, 8], { min: 4, max: 4 }, [4, 4]],
] as const)(
  'normalizes %j on the original grid without mutating input',
  (value, grid, expected) => {
    expect(core.getSteppedRange(Object.freeze(value), grid)).toEqual(expected);
  },
);

it.each([
  [0, 9, [8, 8]],
  [1, 0, [2, 2]],
  [0, 5, [6, 8]],
  [1, 5, [2, 6]],
] as const)(
  'moves endpoint %s to %s without crossing the other endpoint',
  (index, value, expected) => {
    expect(core.getSteppedRange([2, 8], { min: 0, max: 10, step: 2 }, { index, value })).toEqual(
      expected,
    );
  },
);

it.each([[[NaN, 4]], [[0, Infinity]], [[0]], [[0, 1, 2]]])(
  'rejects malformed range %j',
  (value) => {
    expect(() => core.getSteppedRange(value as [number, number], { min: 0, max: 10 })).toThrow(
      TypeError,
    );
  },
);

it('rejects invalid grids and non-finite updates', () => {
  expect(() => core.getSteppedRange([0, 2], { min: 4, max: 2 })).toThrow(RangeError);
  expect(() => core.getSteppedRange([0, 2], { min: 0, max: 10, step: 0 })).toThrow(RangeError);
  expect(() => core.getSteppedRange([0, 2], { min: 0, max: 10 }, { index: 0, value: NaN })).toThrow(
    TypeError,
  );
});
