import { expect, it } from 'vitest';
import * as core from '../../../../src/index.ts';

it('exports Progress with a zero default and determinate progress semantics', () => {
  expect(core).toHaveProperty('getProgressState');
  expect(core.getProgressState()).toEqual({ value: 0, max: 100, percent: 0, complete: false,
    rootProps: { role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': 0 } });
});

it('preserves fractional progress without rounding or mutating input', () => {
  const options = Object.freeze({ value: 3, max: 8 });
  expect(core.getProgressState(options)).toEqual({ value: 3, max: 8, percent: 37.5, complete: false,
    rootProps: { role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 8, 'aria-valuenow': 3 } });
  core.getProgressState({ value: 1000 });
  expect(core.getProgressState(options).percent).toBe(37.5);
  expect(options).toEqual({ value: 3, max: 8 });
});

it.each([[-4, 0, 0, false], [0, 0, 0, false], [8, 8, 100, true], [20, 8, 100, true]] as const)(
  'normalizes value %s and keeps ARIA consistent with completion', (value, normalized, percent, complete) => {
    expect(core.getProgressState({ value, max: 8 })).toEqual({ value: normalized, max: 8, percent, complete,
      rootProps: { role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 8, 'aria-valuenow': normalized } });
  });

it.each([NaN, Infinity, -Infinity])('rejects non-finite value or max %s', number => {
  expect(core).toHaveProperty('getProgressState');
  expect(() => core.getProgressState({ value: number })).toThrow(TypeError);
  expect(() => core.getProgressState({ max: number })).toThrow(TypeError);
});

it.each([0, -0, -1])('rejects non-positive max %s', max => {
  expect(() => core.getProgressState({ max })).toThrow(RangeError);
});

it.each([Number.MAX_VALUE, Number.MIN_VALUE])('handles the finite scale %s without overflow', max => {
  expect(core.getProgressState({ value: max, max })).toMatchObject({ value: max, max, percent: 100, complete: true });
  expect(core.getProgressState({ value: 0, max }).percent).toBe(0);
});

it('normalizes negative zero in value, percentage and ARIA', () => {
  const state = core.getProgressState({ value: -0 });
  expect(state.value).toBe(0);
  expect(state.percent).toBe(0);
  expect(state.rootProps['aria-valuenow']).toBe(0);
});
